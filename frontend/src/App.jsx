import Footer from "./components/footer/Footer"
import Header from "./components/header/Header"
import  { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Outlet } from "react-router-dom"
import Timer from "./components/Timer";
import ScrollToTop from "./components/ScrollToTop";

function App() {

  return (
    <div className="app-layout">
      <ScrollToTop />
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default App
