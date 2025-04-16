import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const MvpPromo: React.FC = () => {
  // Refs for animation elements
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    // Get all elements that need to be animated on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="mvp-promo">
      <Helmet>
        <title>Overlapp - Connect Meaningfully, Effortlessly</title>
      </Helmet>

      {/* Header Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-24 text-center">
        <div className="container mx-auto px-4 z-10 relative">
          <div className="logo text-2xl font-bold mb-6 animate-[fadeInDown_0.8s_0.1s_both]">Overlapp</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-[fadeInDown_0.8s_0.3s_both]">Connect Meaningfully, Effortlessly</h1>
          <p className="subtitle text-xl md:text-2xl max-w-3xl mx-auto mb-6 animate-[fadeInDown_0.8s_0.5s_both]">
            The first digital-physical identity platform that helps you connect with the right people in the right context
          </p>
          <p className="intro max-w-2xl mx-auto mb-8 animate-[fadeInUp_0.8s_0.7s_both]">
            Overlapp brings a new dimension to networking by connecting your digital interests with real-world contexts, creating deeper, more meaningful connections wherever you go.
          </p>
          <div className="cta-buttons-container animate-[fadeInUp_0.8s_0.9s_both]">
            <Link href="/signup">
              <Button size="lg" className="mx-2 bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105">
                Get Early Access
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="mx-2 border-yellow-400 text-yellow-400 hover:text-yellow-500 hover:border-yellow-500 hover:bg-yellow-100/10 transition-all transform hover:-translate-y-1 hover:scale-105">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/90 to-indigo-600/90"></div>
      </header>

      {/* Video Section */}
      <section id="video-intro" className="py-16 bg-white" ref={el => sectionRefs.current[0] = el}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 animate-on-scroll">See Overlapp in Action</h2>
          <p className="section-intro text-lg text-gray-600 max-w-3xl mx-auto mb-10 animate-on-scroll">
            Watch how Overlapp seamlessly connects your digital identity with your physical world experiences, creating meaningful connections in real-time.
          </p>
          <div className="video-wrapper max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl animate-on-scroll">
            <iframe 
              width="560" 
              height="315" 
              src="https://www.youtube.com/embed/Rk7t0TWYNDg?si=VQwCYCc8L2LOOKTT&showinfo=0&controls=1" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
              className="w-full aspect-video">
            </iframe>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50" ref={el => sectionRefs.current[1] = el}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 animate-on-scroll">Why Choose Overlapp?</h2>
          <p className="section-intro text-lg text-gray-600 max-w-3xl mx-auto mb-10 animate-on-scroll">
            Our platform offers a unique blend of digital and physical identity management, creating new opportunities for meaningful connection.
          </p>
          
          <div className="features-grid grid md:grid-cols-2 gap-8 mt-12">
            <div className="feature-item bg-white p-8 rounded-xl shadow-md border-l-4 border-indigo-500 text-left hover:shadow-lg transition-all transform hover:-translate-y-1 animate-on-scroll">
              <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
                <span className="feature-number bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                Context-Aware Connections
              </h3>
              <p className="text-gray-600">
                Overlapp detects your physical environment and identifies meaningful connection opportunities based on shared interests and goals, whether you're at a café, conference, or retail space.
              </p>
            </div>
            
            <div className="feature-item bg-white p-8 rounded-xl shadow-md border-l-4 border-indigo-500 text-left hover:shadow-lg transition-all transform hover:-translate-y-1 animate-on-scroll">
              <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
                <span className="feature-number bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
                Digital-Physical Identity
              </h3>
              <p className="text-gray-600">
                Create a comprehensive profile that intelligently adapts to different contexts, highlighting the most relevant aspects of your identity for each situation and environment.
              </p>
            </div>
            
            <div className="feature-item bg-white p-8 rounded-xl shadow-md border-l-4 border-indigo-500 text-left hover:shadow-lg transition-all transform hover:-translate-y-1 animate-on-scroll">
              <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
                <span className="feature-number bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                Smart Connection Analytics
              </h3>
              <p className="text-gray-600">
                Visualize and explore your connection patterns across different contexts, gaining insights into your networking habits and discovering new opportunities.
              </p>
            </div>
            
            <div className="feature-item bg-white p-8 rounded-xl shadow-md border-l-4 border-indigo-500 text-left hover:shadow-lg transition-all transform hover:-translate-y-1 animate-on-scroll">
              <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
                <span className="feature-number bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span>
                Seamless Integration
              </h3>
              <p className="text-gray-600">
                Overlapp integrates with your existing digital ecosystem, enhancing your experience in both online and offline environments without disrupting your normal routines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-16 bg-blue-50" ref={el => sectionRefs.current[2] = el}>
        <div className="container mx-auto px-4">
          <div className="privacy-icon text-5xl text-indigo-500 mb-6 animate-on-scroll">🔒</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 animate-on-scroll">Your Privacy, Our Priority</h2>
          <p className="section-intro text-lg text-gray-600 max-w-3xl mx-auto mb-6 animate-on-scroll">
            At Overlapp, we believe that meaningful connections should never come at the expense of privacy.
          </p>
          <p className="max-w-2xl mx-auto text-gray-600 mb-8 animate-on-scroll">
            Our platform is built with privacy by design, giving you complete control over what information is shared, when, and with whom. Your data belongs to you, and we're committed to keeping it that way.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="py-16 bg-gradient-to-br from-purple-700 to-indigo-600 text-white" ref={el => sectionRefs.current[3] = el}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Be Among the First</h2>
          <p className="section-intro text-xl max-w-3xl mx-auto mb-10">
            Join our exclusive beta program and experience the future of digital-physical networking before anyone else.
          </p>
          
          <div className="form-container max-w-md mx-auto animate-on-scroll">
            <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm">
              <label htmlFor="email" className="block text-left mb-2 text-white/90 font-semibold">Your Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="you@example.com" 
                className="w-full p-4 mb-6 rounded-lg text-black bg-white/90 focus:bg-white transition-colors"
              />
              <Button size="lg" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-lg py-6">
                Request Early Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-800 text-gray-400 text-center">
        <div className="container mx-auto px-4">
          <p className="mb-2">© 2025 Overlapp. All rights reserved.</p>
          <p className="mb-2">
            <Link href="/privacy" className="text-gray-400 hover:text-white mx-2">Privacy Policy</Link> |
            <Link href="/terms" className="text-gray-400 hover:text-white mx-2">Terms of Service</Link> |
            <Link href="/" className="text-gray-400 hover:text-white mx-2">Home</Link>
          </p>
        </div>
      </footer>

      {/* Custom CSS embedded in the component */}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .animate-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .video-wrapper {
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        
        .video-wrapper.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .privacy-icon.is-visible {
          opacity: 1;
          transform: scale(1);
        }
        
        .form-container.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      ` }} />
    </div>
  );
};

export default MvpPromo;