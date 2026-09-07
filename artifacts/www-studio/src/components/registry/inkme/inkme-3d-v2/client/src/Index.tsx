import React from "react";
import ReactDOM from "react-dom/client";
import App from "../src/main-component/App/App";
import reportWebVitals from "./reportWebVitals";
import { ParallaxProvider } from "react-scroll-parallax";
import "./css/all.min.css";
import "./css/animate.css";
import "./css/main.css";
import "./scss/main.css";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/index";
import { Provider } from "react-redux";
import { MyProvider } from "./context/MyContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

//Google Analytics has been set up in index.html with ID: G-7ZCPCVX6F7
//Just set window.GA_MEASUREMENT_ID for analytics.js to use
window.GA_MEASUREMENT_ID = "G-7ZCPCVX6F7";

//Ensure the gtag function is available for analytics utilities
window.gtag = window.gtag || function () {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ParallaxProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <MyProvider>
            <App />
          </MyProvider>
        </GoogleOAuthProvider>
      </ParallaxProvider>
    </PersistGate>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
export { Index as InkMeIndex };
