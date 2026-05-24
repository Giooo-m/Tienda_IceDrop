using MySql.Data.MySqlClient;
using BCrypt.Net;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURACIÓN DE SERVICIOS ---
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options => {
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// --- MIDDLEWARE ---
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseSession(); 

string connectionString = "Server=localhost;Database=tienda;Uid=root;Pwd=;";

// --- 1. PRODUCTOS (GET) ---
app.MapGet("/api/productos", () => {
    var productos = new List<object>();
    try {
        using (var connection = new MySqlConnection(connectionString)) {
            connection.Open();
            // Usamos 'producto' en minúsculas para coincidir con tu DB
            var sql = "SELECT id_producto, nombre, precio, stock, id_categoria_publico, imagen_binaria FROM producto";
            using (var cmd = new MySqlCommand(sql, connection)) {
                using (var reader = cmd.ExecuteReader()) {
                    while (reader.Read()) {
                        string fotoBase64 = "";
                        if (!reader.IsDBNull(reader.GetOrdinal("imagen_binaria"))) {
                            byte[] bytes = (byte[])reader["imagen_binaria"];
                            fotoBase64 = Convert.ToBase64String(bytes);
                        }
                        productos.Add(new {
                            id = reader.GetInt32("id_producto"),
                            nombre = reader.GetString("nombre"),
                            precio = reader.GetDecimal("precio"),
                            stock = reader.GetInt32("stock"),
                            categoriaPublico = reader.GetInt32("id_categoria_publico"),
                            imagen = fotoBase64 
                        });
                    }
                }
            }
        }
        return Results.Ok(productos);
    } catch (Exception ex) {
        return Results.Problem("Error: " + ex.Message);
    }
});

// --- 2. REGISTRO ---
app.MapPost("/api/register", (UsuarioDto reg) => {
    try {
        string hash = BCrypt.Net.BCrypt.HashPassword(reg.Password);
        using (var connection = new MySqlConnection(connectionString)) {
            connection.Open();
            var sql = "INSERT INTO usuario (nombre, correo, password, rol) VALUES (@nom, @corr, @pass, 'USER')";
            using (var cmd = new MySqlCommand(sql, connection)) {
                cmd.Parameters.AddWithValue("@nom", reg.Nombre);
                cmd.Parameters.AddWithValue("@corr", reg.Correo);
                cmd.Parameters.AddWithValue("@pass", hash);
                cmd.ExecuteNonQuery();
            }
        }
        return Results.Ok(new { mensaje = "Usuario registrado" });
    } catch (Exception ex) {
        return Results.Problem("Error al registrar: " + ex.Message);
    }
});

// --- 3. LOGIN (AJUSTADO PARA REGRESAR ID) ---
app.MapPost("/api/login", (HttpContext context, LoginDto login) => {
    try {
        using (var connection = new MySqlConnection(connectionString)) {
            connection.Open();
            var sql = "SELECT id_usuario, nombre, password, rol FROM usuario WHERE correo = @corr";
            using (var cmd = new MySqlCommand(sql, connection)) {
                cmd.Parameters.AddWithValue("@corr", login.Correo);
                using (var reader = cmd.ExecuteReader()) {
                    if (reader.Read()) {
                        string storedHash = reader.GetString("password");
                        if (BCrypt.Net.BCrypt.Verify(login.Password, storedHash)) {
                            context.Session.SetString("Nombre", reader["nombre"].ToString());
                            context.Session.SetString("Rol", reader["rol"].ToString());

                            return Results.Ok(new { 
                                id_usuario = Convert.ToInt32(reader["id_usuario"]),
                                nombre = reader["nombre"].ToString(), 
                                rol = reader["rol"].ToString() 
                            });
                        }
                    }
                }
            }
        }
        return Results.Unauthorized();
    } catch (Exception ex) {
        return Results.Problem("Error en login: " + ex.Message);
    }
});

// --- 4. ADMIN: ELIMINAR PRODUCTO ---
app.MapDelete("/api/productos/{id}", (int id) => {
    try {
        using (var connection = new MySqlConnection(connectionString)) {
            connection.Open();
            var sql = "DELETE FROM producto WHERE id_producto = @id";
            using (var cmd = new MySqlCommand(sql, connection)) {
                cmd.Parameters.AddWithValue("@id", id);
                cmd.ExecuteNonQuery();
            }
        }
        return Results.Ok(new { mensaje = "Producto eliminado" });
    } catch (Exception ex) {
        return Results.Problem("Error al eliminar: " + ex.Message);
    }
});

// --- 5. ADMIN: AGREGAR PRODUCTO (CON IMAGEN) ---
app.MapPost("/api/productos", async (HttpRequest request) => {
    try {
        var form = await request.ReadFormAsync();
        var nombre = form["prod-nombre"];
        var precio = decimal.Parse(form["prod-precio"]);
        var stock = int.Parse(form["prod-stock"]);
        var cat = int.Parse(form["prod-categoria"]);
        var file = form.Files["prod-imagen"];

        byte[] imagenBytes = null;
        if (file != null) {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            imagenBytes = ms.ToArray();
        }

        using (var connection = new MySqlConnection(connectionString)) {
            connection.Open();
            var sql = "INSERT INTO producto (nombre, precio, stock, id_categoria_publico, imagen_binaria, id_categoria_tipo) VALUES (@nom, @pre, @sto, @cat, @img, 1)";
            using (var cmd = new MySqlCommand(sql, connection)) {
                cmd.Parameters.AddWithValue("@nom", nombre);
                cmd.Parameters.AddWithValue("@pre", precio);
                cmd.Parameters.AddWithValue("@sto", stock);
                cmd.Parameters.AddWithValue("@cat", cat);
                cmd.Parameters.AddWithValue("@img", imagenBytes);
                cmd.ExecuteNonQuery();
            }
        }
        return Results.Ok(new { mensaje = "Producto añadido a ICE DROP" });
    } catch (Exception ex) {
        return Results.Problem("Error al agregar: " + ex.Message);
    }
});

// --- 6. GUARDAR PEDIDO EN LA BD (NUEVO ENDPOINT) ---
app.MapPost("/api/pedidos", async (PedidoDto pedidoDto) =>
{
    try
    {
        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            string query = "INSERT INTO pedido (id_usuario, fecha, total) VALUES (@id_usuario, @fecha, @total);";
            
            using (var cmd = new MySqlCommand(query, connection))
            {
                cmd.Parameters.AddWithValue("@id_usuario", pedidoDto.IdUsuario);
                cmd.Parameters.AddWithValue("@fecha", DateTime.Now);
                cmd.Parameters.AddWithValue("@total", pedidoDto.Total);

                cmd.ExecuteNonQuery();
            }
        }
        return Results.Ok(new { mensaje = "Pedido registrado en MariaDB correctamente." });
    }
    catch (Exception ex)
    {
        return Results.Problem("Error crítico al guardar pedido: " + ex.Message);
    }
});

// --- 7. OTROS ---
app.MapPost("/api/logout", (HttpContext context) => {
    context.Session.Clear();
    return Results.Ok(new { mensaje = "Sesión cerrada" });
});

app.MapGet("/api/session", (HttpContext context) => {
    var nombre = context.Session.GetString("Nombre");
    if (nombre == null) return Results.NotFound();
    return Results.Ok(new { nombre, rol = context.Session.GetString("Rol") });
});

// ESTA LÍNEA SIEMPRE AL FINAL
app.Run();

// MODELOS / DTOS
public record UsuarioDto(string Nombre, string Correo, string Password);
public record LoginDto(string Correo, string Password);
public record PedidoDto(int IdUsuario, decimal Total);