import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import PlataformaPage from "./pages/PlataformaPage";
import ProductosPage from "./pages/ProductosPage";
// (luego agregarás TenderoPage y ProveedorPage también)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/plataforma" element={<PlataformaPage />} />
        <Route path="/listado-productos" element={<ProductosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
