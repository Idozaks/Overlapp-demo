
import React from "react";
import { Star } from "lucide-react";

export default function ConnectedRetail() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">Connected Retail Experience</h1>
      <p className="text-lg text-center text-muted-foreground mb-10">
        Discover personalized offers and experiences from your favorite retailers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Fashion Hub Card */}
        <div className="rounded-lg overflow-hidden border bg-card">
          <div className="h-64 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2xvdGhpbmclMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60" 
              alt="Fashion Hub" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">Fashion Hub</h2>
              <span className="px-2 py-1 rounded-md bg-muted text-sm">🏪 Clothing</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="ml-2 font-semibold">4.8</span>
              </div>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">% 20% off</span>
            </div>
          </div>
        </div>

        {/* Tech Store Card */}
        <div className="rounded-lg overflow-hidden border bg-card">
          <div className="h-64 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFwcGxlJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60" 
              alt="Tech Store" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">Tech Store</h2>
              <span className="px-2 py-1 rounded-md bg-muted text-sm">🏪 Electronics</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="ml-2 font-semibold">4.9</span>
              </div>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">% Free Gift</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
