import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import FeaturedDiscounts from '../components/FeaturedDiscounts';

const Home = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Empowering Educators with Comprehensive Resources</h1>
          <p>
            Discover scholarships, track applications, access teacher discounts, and get AI-powered essay assistance. 
            Everything you need to secure funding and save money, all in one platform.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <button 
                  onClick={() => window.location.href = '/#features'}
                  className="btn btn-secondary btn-lg"
                >
                  Learn More
                </button>
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="p-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Choose TeachEasy?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The comprehensive platform for educators featuring scholarship discovery, application tracking, teacher discounts, and AI-powered essay assistance to help you secure funding and save money.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full max-w-md">
              <h3 className="text-xl font-semibold mb-3 text-center">Scholarship Discovery</h3>
              <p className="text-gray-600 text-center">
                Find scholarships and grants that match your school, subject, and funding needs with smart filtering.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full max-w-md">
              <h3 className="text-xl font-semibold mb-3 text-center">Application Tracking</h3>
              <p className="text-gray-600 text-center">
                Track your scholarship applications, manage deadlines, and monitor your progress in one place.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full max-w-md">
              <h3 className="text-xl font-semibold mb-3 text-center">Teacher Discounts</h3>
              <p className="text-gray-600 text-center">
                Access exclusive discounts and savings from retailers and services designed specifically for educators.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full max-w-md">
              <h3 className="text-xl font-semibold mb-3 text-center">AI Essay Assistant</h3>
              <p className="text-gray-600 text-center">
                Get personalized help writing compelling grant applications with our AI-powered essay assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 p-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Opportunities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-gray-600">Total Funding Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1,200+</div>
              <div className="text-gray-600">Teachers Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Discounts Section */}
      <FeaturedDiscounts />

      {/* CTA Section */}
      <section className="p-8">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of educators who have already discovered funding opportunities through TeachEasy.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              View Opportunities
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Get Started Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
