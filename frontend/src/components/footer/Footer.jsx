import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-lg">
        <Link to={"/"} className="footer-logo">
          <h1>DESSERTS</h1>
        </Link>
        <div className="footer">
          <div className="footer-info">
            <h1>DESSERTS INFO</h1>
            <li>
              <Link to="/about">About DESSERTS</Link>
            </li>
            <li>
              <Link to="/outreach">Reach out to US</Link>
            </li>
            <li>
              <Link to="/terms">Terms and Conditions</Link>
            </li>
          </div>
          <div className="footer-info">
            <h1>DESSERTS Cares</h1>
            <li>
              <Link to="/info">Allergens Info</Link>
            </li>
            <li>
              <Link to="/quality">Our Desserts</Link>
            </li>
            <li>
              <Link to="/responsibility">Responsibility</Link>
            </li>
          </div>
          <div className="footer-info">
            <h1>DESSERTS and You</h1>
            <li>
              <Link to="/careers">Careers</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy policy</Link>
            </li>
          </div>
        </div>
      </div>
      <div className="contact">
        <div className="socials">
          <li>
            <Link to="https://www.facebook.com/" target="_blank">
              <FaFacebookF className="icons" />
            </Link>
          </li>
          <li>
            <Link to="https://www.instagram.com/jlb_me/" target="_blank">
              <FaInstagram className="icons" />
            </Link>
          </li>
          <li>
            <Link to="https://www.twitter.com/jlbspyder/" target="_blank">
              <FaXTwitter className="icons" />
            </Link>
          </li>
          <li>
            <Link to="https://www.youtube.com/" target="_blank">
              <FaYoutube className="icon" />
            </Link>
          </li>
        </div>
        <h6>TM & Copyright {year} Desserts Corporation. All Rights Reserved.</h6>
      </div>
    </footer>
  );
};

export default Footer;
