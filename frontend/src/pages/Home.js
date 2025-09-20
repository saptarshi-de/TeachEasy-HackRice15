import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Home = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Empowering Educators with Resources</h1>
          <p>
            Find scholarships, grants, and funding opportunities tailored to your teaching needs. 
            Save time and focus on what matters most - your students.
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
              We understand the challenges educators face and provide the tools you need to secure funding for your classroom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Smart Filtering</h3>
              <p className="text-gray-600">
                Find opportunities that match your school, subject, and funding needs with our intelligent filtering system.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Save & Track</h3>
              <p className="text-gray-600">
                Bookmark opportunities you're interested in and track your application progress all in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600">
                Get recommendations based on your profile and teaching context for the most relevant opportunities.
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
