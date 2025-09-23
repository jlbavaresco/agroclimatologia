import 'bootstrap/dist/css/bootstrap.min.css'
import '@popperjs/core/dist/cjs/popper.js'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import SomaTermica from './componentes/somatermica/SomaTermica'
import { createBrowserRouter, RouterProvider } from "react-router";
import Menu from './componentes/Menu'
import Home from './componentes/telas/Home'
import Sobre from "./componentes/telas/Sobre";
import DadosMeteorologicos from './componentes/dadosmeteorologicos/DadosMeteorologicos'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Menu />,
    children: [
      {
        index: true,
        element: <DadosMeteorologicos />,
      },
      {
        path: "/somatermica",
        element: <SomaTermica />,
      },
      {
        path: "/dadosmeteo",
        element: <DadosMeteorologicos />,
      },      
      {
        path: "/sobre",
        element: <Sobre />,
      }
    ]
  }

]);

function App() {

  return (
    <RouterProvider router={router} />
  );
}

export default App;