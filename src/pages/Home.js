import React from "react";
import { Link } from "react-router-dom";
import "./styles/Home.css"; // External CSS for animations

const Home = () => {
  return (
    <body className="home">
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">Project Management</div>
        
        <Link to="/login" className="login-btn">
          Connexion
        </Link>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Text Section */}
        <div className="content" data-animation="fade-in-left">
          <h1>
            Project <span className="highlight">Management</span>
          </h1>
          <p>
            Gagnez du temps, attirez plus de clients et renforcez la sécurité grâce à notre solution
            de gestion de projet.
          </p>
          <a href="#" className="cta-btn" data-animation="fade-in-up">
            Rejoindre la liste d'attente
          </a>
        </div>

        {/* Image Section */}
        <div className="image-container" data-animation="fade-in-right">
          <img
            alt="Une femme souriante tenant un ordinateur portable"
            src="https://storage.googleapis.com/a1aa/image/7o1BYWtpiYYXO5TqRP1vjLzbwb1rfFxkHSJyyUDYq7BjNY8JA.jpg"
          />
          <div className="overlay-square"></div>
          <div className="overlay-square-small"></div>
        </div>
      </div>
    </div>
    </body>
  );
};

export default Home;
