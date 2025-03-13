
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function About() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">About Overlapp</h1>
      
      <Tabs defaultValue="common">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="common">For Everyone</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="investor">Investor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="common">
          <Card>
            <CardHeader>
              <CardTitle>The Human Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <h3 className="text-xl font-semibold mb-2">Elevator Speech</h3>
                <p className="italic">
                  "Ever wished your online experience could be more tailored to your preferences? That's exactly what our project is all about. We're giving you the power to create your own digital persona, like a personalized gateway to the online world. Say goodbye to irrelevant ads and hello to offers that actually matter to you. Join us in making the digital world feel more personal and meaningful."
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">What We're Building</h3>
                <p>
                  Our project aims to make your online experience more personalized and enjoyable. We're introducing a platform that allows you to build your own digital persona, essentially a digital version of yourself that helps businesses understand your interests better. This means you'll receive offers and content that are relevant to you, making your online interactions more meaningful. Plus, we take your privacy seriously, using advanced encryption techniques to keep your data safe and secure. Whether you're shopping, browsing, or connecting with friends online, our platform ensures that every interaction feels tailor-made for you. Say hello to a more personalized and enjoyable online experience with our project.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle>Technical Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold mb-2">Elevator Speech</h3>
                <p className="italic">
                  "Our project is pushing the boundaries of digital identity management. We're developing a sophisticated platform that empowers users to create and manage their own encrypted digital personas. Through advanced encryption techniques and seamless integration, we're ensuring user privacy while enabling precise interactions with businesses. Join us in reshaping the future of digital communication with our cutting-edge technology."
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Technical Architecture</h3>
                <p>
                  Our project is at the forefront of technological innovation in the realm of digital identity management. We're engineering a robust platform that allows users to generate and maintain encrypted digital personas, facilitating secure interactions with businesses and services. Our solution incorporates advanced encryption protocols to safeguard user data, ensuring privacy and confidentiality at every step. From a technical standpoint, our platform integrates seamlessly with existing systems, offering businesses a streamlined approach to delivering personalized experiences. With a focus on scalability and reliability, we're committed to setting new standards in digital identity management through continuous refinement and optimization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investor">
          <Card>
            <CardHeader>
              <CardTitle>Investment Opportunity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold mb-2">Elevator Speech</h3>
                <p className="italic">
                  "Imagine being at the forefront of shaping the future of digital engagement. Our project offers just that. We're empowering users to curate their own digital personas, revolutionizing how businesses connect with their audience. Join us as we lead the charge in personalized digital experiences, driving value for both users and businesses alike."
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Market Opportunity</h3>
                <p>
                  Our project is poised to redefine the landscape of digital interaction. We're introducing a groundbreaking platform that enables users to construct personalized digital personas, serving as gateways for businesses to deliver tailor-made offerings. With a focus on privacy and security, our encrypted profiles ensure that user data remains protected while facilitating meaningful engagements. For investors, this represents an opportunity to be part of a transformative venture that promises to revolutionize digital communication and identity management. By leveraging our innovative SaaS solution, businesses can unlock unparalleled insights into user preferences, resulting in higher ROI and enhanced customer satisfaction.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">The Big Idea: "Matcher-DP (DigitalPersona)"</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Core Concept</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Purpose</strong>: Redefine control over personal information by letting users create their own digital personas.</li>
                <li><strong>Key Value</strong>: These user-owned, user-controlled personas enable businesses and services to understand preferences more effectively, ensuring highly targeted (and more relevant) value propositions.</li>
                <li><strong>Privacy & Security</strong>: Encrypted profiles protect personal data while still enabling valuable, personalized experiences.</li>
                <li><strong>User Benefits</strong>: Greater relevance, less clutter, and even potential monetization of one's own data.</li>
                <li><strong>Business Benefits</strong>: Stronger ROI through better-matched offers, leading to higher conversions and more satisfied customers.</li>
                <li><strong>SaaS Model</strong>: Designed for simple self-operation, with an intuitive interface and potentially offered via a Freemium model.</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <strong>User-Created Digital Persona</strong>
                  <ul className="list-disc pl-5 mt-2">
                    <li>A user defines basic preferences or interests.</li>
                    <li>The system then uses AI to "enrich" these preferences, expanding them into detailed interest profiles effortlessly.</li>
                  </ul>
                </li>
                <li>
                  <strong>Controlled Sharing</strong>
                  <ul className="list-disc pl-5 mt-2">
                    <li>The user decides what aspects of their persona to share with different platforms.</li>
                    <li>Encryption ensures privacy; data is only shared with explicit consent.</li>
                  </ul>
                </li>
                <li>
                  <strong>Revolutionizing Digital Communication</strong>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Traditional advertising relies on "guesswork" with tracking pixels or cookies.</li>
                    <li>Our platform inverts this by letting users proactively declare their interests.</li>
                    <li>Advertisers and content providers can then deliver laser-focused, relevant offers.</li>
                  </ul>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Why Now?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Data Privacy Concerns</strong>: Users are increasingly wary of how their data is collected and used by big platforms.</li>
                <li><strong>Efficiency for Advertisers</strong>: Current targeting methods can be wasteful; focusing on user-declared interests drastically improves ad ROI.</li>
                <li><strong>User Empowerment Trend</strong>: Blockchain and NFT-based technologies empower users to "own" their digital identity, opening doors to new monetization avenues.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personalized recommendations on news sites, streaming platforms, online stores, travel sites, etc.</li>
                <li>Quickly finding common interests when meeting new people or attending conferences.</li>
                <li>Monetizing user data by allowing vetted platforms to access preference profiles for relevant, user-approved advertising.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Conclusion</h3>
          <p>
            Matcher-DP (DigitalPersona) heralds a paradigm shift in how digital identities are created, owned, and shared. 
            It champions a user-first model of data ownership and paves the way for more meaningful, 
            privacy-conscious, and profitable interactions on both ends of the digital equation.
          </p>
        </div>
      </div>
    </div>
  );
}
