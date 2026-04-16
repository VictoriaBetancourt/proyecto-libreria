import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReportesPage implements OnInit {
  
  // KPIs amigables (Intactos)
  indicadores = [
    { titulo: 'Libros Totales', valor: '1,245', icono: 'library', color: 'sponchi-blue' },
    { titulo: 'Clientes Felices', valor: '342', icono: 'happy', color: 'sponchi-pink' },
    { titulo: 'Ventas Hoy', valor: '28', icono: 'bag-check', color: 'sponchi-mint' },
    { titulo: 'Alertas', valor: '3', icono: 'alert-circle', color: 'sponchi-orange' }
  ];

  // Variables de navegación y filtros
  categoriaSeleccionada: string = 'inventario';
  querySeleccionada: string = 'stockCritico';

  // Nuevas variables para el Buscador
  terminoBusqueda: string = '';
  criterioBusqueda: string = 'titulo';

  // Catálogo completo de consultas MySQL (Intacto)
  consultasSQL: any = {
    stockCritico: "SELECT titulo, isbn, stock FROM Libros WHERE stock <= 10 ORDER BY stock ASC;",
    valorInventario: "SELECT SUM(stock * precio) AS valor_total_inventario FROM Libros;",
    distribucionGenero: "SELECT g.nombre AS genero, COUNT(l.id) AS total_libros FROM Generos g LEFT JOIN Libros l ON g.id = l.id_genero GROUP BY g.id ORDER BY total_libros DESC;",
    autoresTop: "SELECT a.nombre AS autor, COUNT(l.id) AS total_libros FROM Autores a JOIN Libros l ON a.id = l.id_autor GROUP BY a.id ORDER BY total_libros DESC LIMIT 10;",
    librosHuerfanos: "SELECT id, titulo, isbn FROM Libros WHERE id_autor IS NULL OR id_genero IS NULL;",
    topVendidos: "SELECT l.titulo, SUM(v.cantidad) AS total_vendidos, SUM(v.total) AS ingresos FROM Ventas v JOIN Libros l ON v.id_libro = l.id WHERE YEAR(v.fecha_venta) = YEAR(CURDATE()) GROUP BY l.id ORDER BY total_vendidos DESC LIMIT 10;",
    ingresosGenero: "SELECT g.nombre AS genero, SUM(v.cantidad) AS libros_vendidos, SUM(v.total) AS ingresos_totales FROM Ventas v JOIN Libros l ON v.id_libro = l.id JOIN Generos g ON l.id_genero = g.id GROUP BY g.id ORDER BY ingresos_totales DESC;",
    ticketPromedio: "SELECT ROUND(AVG(total), 2) AS ticket_promedio FROM Pedidos WHERE estado != 'Cancelado';",
    pedidosEstancados: "SELECT id AS id_pedido, fecha_pedido, estado, id_usuario FROM Pedidos WHERE estado = 'Pendiente' AND DATEDIFF(CURDATE(), fecha_pedido) > 7;",
    clientesVIP: "SELECT u.nombre, u.correo, COUNT(p.id) AS total_pedidos, SUM(p.total) AS gasto_total FROM Usuarios u JOIN Pedidos p ON u.id = p.id_usuario WHERE p.estado = 'Entregado' GROUP BY u.id ORDER BY gasto_total DESC LIMIT 10;",
    nuevosUsuarios: "SELECT nombre, correo, fecha_registro FROM Usuarios WHERE YEAR(fecha_registro) = YEAR(CURDATE()) AND MONTH(fecha_registro) = MONTH(CURDATE());",
    usuariosRol: "SELECT r.nombre AS rol, COUNT(u.id) AS total_usuarios FROM Usuarios u JOIN Roles r ON u.id_rol = r.id GROUP BY r.id;",
    topCalificados: "SELECT l.titulo, ROUND(AVG(r.calificacion), 1) AS promedio, COUNT(r.id) AS total_resenas FROM Resenas r JOIN Libros l ON r.id_libro = l.id GROUP BY l.id HAVING total_resenas > 0 ORDER BY promedio DESC, total_resenas DESC LIMIT 10;",
    sinResenas: "SELECT l.titulo, l.isbn FROM Libros l LEFT JOIN Resenas r ON l.id = r.id_libro WHERE r.id IS NULL;"
  };

  columnasTabla: string[] = [];
  datosTabla: any[] = [];

  constructor() { }

  ngOnInit() {
    this.generarReporte();
  }

  cambiarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.terminoBusqueda = ''; // Limpia el buscador

    if(categoria === 'inventario') this.querySeleccionada = 'stockCritico';
    if(categoria === 'ventas') this.querySeleccionada = 'topVendidos';
    if(categoria === 'usuarios') this.querySeleccionada = 'clientesVIP';
    if(categoria === 'marketing') this.querySeleccionada = 'topCalificados';
    
    if(categoria === 'buscador') {
      this.datosTabla = [];
      this.columnasTabla = [];
      return; 
    }
    this.generarReporte();
  }

  // --- FUNCIÓN DEL BUSCADOR INTEGRADA ---
  buscarLibro() {
    if (this.terminoBusqueda.trim() === '') {
      this.datosTabla = [];
      return;
    }

    let queryMySQL = `SELECT l.titulo, l.isbn, a.nombre AS autor, g.nombre AS genero, l.stock, l.precio 
                      FROM Libros l JOIN Autores a ON l.id_autor = a.id JOIN Generos g ON l.id_genero = g.id WHERE `;

    if (this.criterioBusqueda === 'titulo') queryMySQL += `l.titulo LIKE '%${this.terminoBusqueda}%';`;
    if (this.criterioBusqueda === 'autor') queryMySQL += `a.nombre LIKE '%${this.terminoBusqueda}%';`;
    if (this.criterioBusqueda === 'isbn') queryMySQL += `l.isbn = '${this.terminoBusqueda}';`;

    // Simulación de búsqueda
    let respuestaDB = [
      { Título: 'El Señor de los Anillos', Autor: 'J.R.R. Tolkien', ISBN: '978-456', Género: 'Fantasía', Stock: 12, Precio: '$550' },
      { Título: 'Cien Años de Soledad', Autor: 'Gabriel García Márquez', ISBN: '978-789', Género: 'Realismo', Stock: 5, Precio: '$400' },
      { Título: 'It (Eso)', Autor: 'Stephen King', ISBN: '978-123', Género: 'Terror', Stock: 8, Precio: '$350' }
    ];

    let filtrados = respuestaDB.filter(libro => {
      let campo = this.criterioBusqueda === 'titulo' ? libro.Título : (this.criterioBusqueda === 'autor' ? libro.Autor : libro.ISBN);
      return campo.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
    });

    if (filtrados.length > 0) {
      this.columnasTabla = Object.keys(filtrados[0]);
      this.datosTabla = filtrados;
    } else {
      this.datosTabla = [];
    }
  }

  // --- FUNCIÓN ORIGINAL DE REPORTES ---
  generarReporte() {
    if(this.categoriaSeleccionada === 'buscador') return;

    let respuestaDB: any[] = [];
    if (this.querySeleccionada === 'stockCritico') {
      respuestaDB = [
        { Título: 'Don Quijote', ISBN: '978-3-16', Stock: 2, Estado: 'Crítico' },
        { Título: 'Drácula', ISBN: '978-0-14', Stock: 5, Estado: 'Bajo' }
      ];
    } else if (this.querySeleccionada === 'topVendidos') {
      respuestaDB = [
        { Título: 'El Principito', Vendidos: 45, Ingresos: '$4,500' },
        { Título: '1984', Vendidos: 30, Ingresos: '$3,000' }
      ];
    } else if (this.querySeleccionada === 'clientesVIP') {
      respuestaDB = [
        { Nombre: 'María López', Pedidos: 15, Gasto: '$12,500' },
        { Nombre: 'Carlos Pérez', Pedidos: 12, Gasto: '$9,800' }
      ];
    } else {
      respuestaDB = [{ Mensaje: 'Reporte generado. Conecta la DB para ver datos reales.' }];
    }

    if (respuestaDB.length > 0) {
      this.columnasTabla = Object.keys(respuestaDB[0]);
      this.datosTabla = respuestaDB;
    }
  }
}
