import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const onboardingSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(500),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  retailPreferences: z.array(z.string()).optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const PREDEFINED_INTERESTS = [
  "Technology",
  "Fashion",
  "Sports",
  "Gaming",
  "Music",
  "Art",
  "Travel",
  "Food",
  "Fitness",
];

export default function OnboardingFlow() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      interests: [],
      retailPreferences: [],
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await apiRequest("/api/users/onboarding", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        throw new Error("Failed to save onboarding data");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessMessage"),
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: t("profile.updateError"),
        description: t("profile.updateErrorMessage"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OnboardingData) => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    await onboardingMutation.mutateAsync({
      ...data,
      interests: selectedInterests,
    });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
    form.setValue("interests", selectedInterests);
  };

  const steps = [
    {
      title: t("profile.personalInfo"),
      description: t("profile.bioDescription"),
      content: (
        <>
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.displayName")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.bio")}</FormLabel>
                <FormControl>
                  <Textarea {...field} maxLength={500} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ),
    },
    {
      title: t("profile.interests"),
      description: t("profile.selectInterestsFirst"),
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_INTERESTS.map((interest) => (
              <Badge
                key={interest}
                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
          {form.formState.errors.interests && (
            <p className="text-sm text-destructive">
              {form.formState.errors.interests.message}
            </p>
          )}
        </div>
      ),
    },
    {
      title: t("profile.retailPreferences"),
      description: t("profile.selectRetailPreferences"),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Coming soon: Personalized shopping preferences
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{steps[step].title}</CardTitle>
          <CardDescription>{steps[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={onboardingMutation.isPending}
                >
                  {step === steps.length - 1 ? "Complete" : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
