import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const onboardingSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  privacySettings: z.object({
    shareLocation: z.boolean(),
    allowAiSuggestions: z.boolean(),
    publicProfile: z.boolean(),
    shareInterests: z.boolean(),
  }),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const INTERESTS = [
  "Technology",
  "Sustainability",
  "Fashion",
  "Food",
  "Travel",
  "Art",
  "Music",
  "Sports",
  "Health",
  "Education"
] as const;

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      interests: user?.preferences?.interests || [],
      privacySettings: {
        shareLocation: true,
        allowAiSuggestions: true,
        publicProfile: true,
        shareInterests: true,
      },
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!user) throw new Error("No user found");

      const response = await apiRequest(`/api/users/${user.id}`, {
        method: "PATCH",
        body: {
          ...data,
          preferences: {
            interests: data.interests,
            privacySettings: data.privacySettings,
            onboardingCompleted: true,
          },
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      navigate("/");
    },
  });

  const nextStep = () => {
    const fields = {
      1: ["displayName"] as const,
      2: ["interests"] as const,
      3: ["privacySettings"] as const,
    }[step];

    const isValid = fields?.every(
      (field) => !form.formState.errors[field]
    );

    if (isValid) {
      if (step === totalSteps) {
        const values = form.getValues();
        updateProfileMutation.mutate(values);
      } else {
        setStep((s) => Math.min(s + 1, totalSteps));
      }
    }
  };

  if (!user) {
    navigate("/signup");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Mycelium Matchmaker</CardTitle>
          <CardDescription>
            Let's set up your digital identity. This will help us connect you with like-minded individuals and relevant content.
          </CardDescription>
          <Progress
            value={(step / totalSteps) * 100}
            className="h-2 mt-4"
          />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
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
                        <FormLabel>Bio (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <FormLabel>Select Your Interests</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {INTERESTS.map((interest) => (
                            <FormField
                              key={interest}
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                const checked = field.value?.includes(interest);
                                return (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(isChecked) => {
                                          const value = field.value || [];
                                          field.onChange(
                                            isChecked
                                              ? [...value, interest]
                                              : value.filter((i) => i !== interest)
                                          );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {interest}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: "shareLocation",
                        label: "Share Location",
                        description:
                          "Allow us to use your location for better recommendations",
                      },
                      {
                        id: "allowAiSuggestions",
                        label: "AI Suggestions",
                        description:
                          "Get personalized suggestions based on your interests",
                      },
                      {
                        id: "publicProfile",
                        label: "Public Profile",
                        description:
                          "Make your profile visible to other users",
                      },
                      {
                        id: "shareInterests",
                        label: "Share Interests",
                        description:
                          "Show your interests to other users",
                      },
                    ].map(({ id, label, description }) => (
                      <FormField
                        key={id}
                        control={form.control}
                        name={`privacySettings.${id}` as keyof OnboardingData}
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{label}</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {description}
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(s - 1, 1))}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  className="ml-auto"
                  onClick={nextStep}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === totalSteps ? (
                    "Complete"
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}