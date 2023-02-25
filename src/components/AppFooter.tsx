import React from "react";
import { Link } from "react-router-dom";

function AppFooter() {
  return (
    <footer className="footer mt-4">
      <div className="columns is-centered">
        <div className="column is-narrow">
          <Link to={"/privacy"}>Privacy Policy</Link>
        </div>
        <div className="column is-narrow">
          <Link to={"/terms"}>Terms of Use</Link>
        </div>
        <div className="column is-narrow">
          <Link to={"https://github.com/astralfrontier/newman-garage"} target="_blank">GitHub</Link>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
