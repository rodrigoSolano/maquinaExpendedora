import { useEffect, useState } from "react";
import "./App.css";

class Producto {
  constructor(nombre, precio, codigo) {
    this.nombre = nombre;
    this.precio = precio;
    this.codigo = codigo;
  }
}

class Seccion {
  constructor(codigo) {
    this.codigo = codigo;
    this.productos = [];
  }
}

class Moneda {
  constructor(valor, cantidad) {
    this.valor = valor;
    this.cantidad = cantidad;
  }
}

class MaquinaExpendedora {
  constructor() {
    this.secciones = [
      new Seccion("A"),
      new Seccion("B"),
      new Seccion("C"),
      new Seccion("D"),
      new Seccion("E"),
      new Seccion("F"),
      new Seccion("G"),
      new Seccion("H"),
      new Seccion("I"),
      new Seccion("J"),
      new Seccion("K"),
      new Seccion("L"),
      new Seccion("M"),
      new Seccion("N"),
      new Seccion("O"),
      new Seccion("P"),
      new Seccion("Q"),
      new Seccion("R"),
      new Seccion("S"),
      new Seccion("T"),
    ];
    this.monedas = [
      new Moneda(1, 10),
      new Moneda(2, 10),
      new Moneda(5, 10),
      new Moneda(10, 10),
    ];
    this.totalDinero = this.calcularTotalDinero();
    let codigoProductos = 10;
    this.secciones.forEach((seccion) => {
      for (let i = 0; i < 10; i++) {
        this.agregarProducto(
          new Producto(
            "Producto",
            parseInt(Math.random() * (25 - 10) + 10, 10),
            `${codigoProductos}`
          ),
          seccion.codigo
        );
      }
      codigoProductos += 10;
    });
  }

  calcularTotalDinero() {
    let total = 0;
    this.monedas.forEach((moneda) => {
      total += moneda.valor * moneda.cantidad;
    });
    return total;
  }

  buscarProducto(codigoProducto) {
    if (!codigoProducto) throw new Error("Codigo de producto no valido");
    let secciones = this.secciones.filter((seccion) => {
      const _producto = seccion.productos[0];
      return _producto.codigo === codigoProducto;
    });
    return secciones[0]?.productos[0] ? secciones[0].productos[0] : null;
  }

  agregarProducto(producto, codigoSeccion) {
    let seccion = this.secciones.find(
      (seccion) => seccion.codigo === codigoSeccion
    );
    if (!seccion) throw new Error("Seccion no encontrada");
    seccion.productos.push(producto);
  }

  eliminarProducto(codigoProducto) {
    let seccion = this.secciones.find((seccion) => {
      const _producto = seccion.productos[0];
      return _producto.codigo === codigoProducto;
    });
    if (!seccion) throw new Error("Seccion no encontrada");
    seccion.productos.shift();
  }

  darCambios(cambio) {
    let monedas = [];
    let monedasDisponibles = this.monedas.filter(
      (moneda) => moneda.cantidad > 0
    );
    monedasDisponibles.sort((a, b) => b.valor - a.valor);
    monedasDisponibles.forEach((moneda) => {
      while (cambio >= moneda.valor && moneda.cantidad > 0) {
        monedas.push(moneda.valor);
        cambio -= moneda.valor;
        moneda.cantidad--;
      }
    });
    return monedas;
  }

  comprarProducto(codigoProducto, dineroIngresado) {
    let producto = this.buscarProducto(codigoProducto);
    if (!producto) throw new Error("Producto no encontrado");

    if (producto.precio > dineroIngresado)
      throw new Error("Dinero ingresado insuficiente");

    if (this.totalDinero < producto.precio)
      throw new Error("No hay dinero suficiente en la maquina para dar cambio");

    this.eliminarProducto(producto.codigo);
    const cambioADar = dineroIngresado - producto.precio;
    const monedas = this.darCambios(cambioADar);
    return monedas;
  }
}

function App() {
  const [maquinaExpendedora] = useState(new MaquinaExpendedora());
  const botones = Array.from({ length: 9 }, (_, i) => i + 1);

  const [display, setDisplay] = useState("");
  const [dineroIngresado, setDinero] = useState(0);
  const [errores, setAlerta] = useState("Dinero ingresado insuficiente");
  const [cambio, setCambio] = useState();

  const handleNumberClick = (value) => setDisplay(display + value);

  const deleteNumber = () => setDisplay(display.slice(0, -1));

  const haveAColision = (elemento1, elemento2) => {
    const rect1 = elemento1.getBoundingClientRect();
    const rect2 = elemento2.getBoundingClientRect();
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  };

  const dragItemHandler = (itemClassName, containerClassName) => {
    let dragItem = document.querySelector(itemClassName);
    let container = document.querySelector(containerClassName);

    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);

    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      active = false;
      // detecta si el elemento se soltó dentro de un contenedor con la clase recolectorDeMonedas
      const recolectorDeMonedas = document.querySelector(
        ".recolectorDeMonedas"
      );
      // detecta si hay colisión entre el elemento y el contenedor
      if (haveAColision(dragItem, recolectorDeMonedas)) {
        // quitar el $ del elemento
        const valor = dragItem.textContent.slice(1);
        setDinero((prev) => prev + parseInt(valor));
        dragItem.style.transform = "translate3d(0px, 0px, 0px)";
      }
    }

    function drag(e) {
      if (active) {
        e.preventDefault();

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
  };

  const comprarProducto = () => {
    try {
      const monedas = maquinaExpendedora.comprarProducto(
        display,
        dineroIngresado
      );
      setDinero(0);
      setCambio(monedas);
      setDisplay("Gracias por su compra");
      document.querySelector(".alerta").style.opacity = 0;
    } catch (error) {
      const alerta = document.querySelector(".alerta");
      alerta.style.opacity = 1;
      setAlerta(error.message);
    }
  };

  useEffect(() => {
    dragItemHandler(".moneda1", ".app");
    dragItemHandler(".moneda2", ".app");
    dragItemHandler(".moneda5", ".app");
    dragItemHandler(".moneda10", ".app");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maquinaExpendedora, maquinaExpendedora.secciones]);

  useEffect(() => {
    if (display === "Gracias por su compra") {
      setTimeout(() => {
        setDisplay("");
      }, 1500);
    }
  }, [display]);

  return (
    <div className="app">
      <div className="maquinaDispensadora">
        <div style={{ display: "flex", gap: "24px" }}>
          <div className="contenedorDeSecciones">
            {maquinaExpendedora.secciones.map((seccion, i) => (
              <div key={seccion.codigo} className="seccion">
                <div className="producto">
                  <p>${seccion?.productos[0]?.precio}</p>

                  <p
                    style={{
                      color: "#FFFFFF",
                      position: "absolute",
                      fontSize: "12px",
                      width: "20px",
                      height: "20px",
                      bottom: "-20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: "1",
                    }}
                  >
                    {seccion?.productos[0]?.codigo}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="contenedorMonedasYTeclado">
            <div className="display">{display}</div>
            <div className="tecladoNumerico">
              {botones.map((boton) => (
                <button
                  key={boton}
                  className="boton"
                  onClick={() => handleNumberClick(boton)}
                >
                  {boton}
                </button>
              ))}
              <button className="boton" onClick={() => handleNumberClick(0)}>
                {0}
              </button>
              <button className="boton del" onClick={deleteNumber}>
                &lt;-
              </button>
              <button className="boton comprar" onClick={comprarProducto} />
            </div>
            <div className="indicadorRecolectorDeMonedas" />
            <div className="recolectorDeBilletes" />
            <div className="recolectorDeMonedas" />
          </div>
        </div>
        <div className="contenedorDeDispensadoreYCambio">
          <div className="dispensador" />
          <div className="cambio" />
        </div>
        <div className="alerta">{errores}</div>
      </div>
      <div>
        <p>Monedas:</p>
        <div className="contenedorDeMonedas">
          <div data-value={1} className="moneda moneda1">
            $1
          </div>
          <div data-value={2} className="moneda moneda2">
            $2
          </div>
          <div data-value={5} className="moneda moneda5">
            $5
          </div>
          <div data-value={10} className="moneda moneda10">
            $10
          </div>
        </div>
        <p style={{ marginTop: "25px" }}>
          <strong>Informacion util:</strong>
        </p>
        <div style={{ display: "flex", flexDirection: "row", gap: "25px" }}>
          <p>
            <strong>Dinero:</strong> ${dineroIngresado}
          </p>
          <p>
            <strong>Cambio:</strong> {cambio ? `$${cambio}` : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
