const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { validateUser } = require("../middleware/auth");
const { generateToken } = require("../config/envs");

//registar un usuario
router.post("/register", (req, res) => {
  console.log("body", req.body);
  User.create(req.body).then((user) => {
    console.log("users", user);
    return res.status(201).send(user);
  });
});
// iniciar sesion
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({
    where: { email },
  }).then((user) => {
    if (!user) return res.send(401);
    user.validatePassword(password).then((isValidate) => {
      if (!isValidate) return res.send(401);
      else {
        const payload = {
          email: user.email,
          name: user.name,
          id: user.id,
        };
        const token = generateToken(payload);
        res.status(201).cookie("token", token).send(payload);
      }
    });
  });
});
//persistencia
router.get("/me", validateUser, (req, res) => {
  console.log(req.user);
  res.send(req.user);
});
//cerrar sesion
router.post("/logout", (req, res) => {
  res.clearCookie("token").sendStatus(204);
});

// favoritos
router.post("/favoritos", validateUser, async (req, res) => {
  try {
    const email = req.user.email;
    const { tmdb_id } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "No se encontró el perfil del usuario" });
    }

    const userId = user.id;

    // Crear en la base de datos
    const createdFavorito = await Favorito.create({ user_id: userId, tmdb_id });

    return res.status(201).json(createdFavorito);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.get("/favoritos", validateUser, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "No se encontró el perfil del usuario" });
    }

    const userId = user.id;

    const favoritos = await Favorito.findAll({ where: { user_id: userId } });

    const tmdbIds = favoritos.map((favorito) => favorito.tmdb_id);

    // Consulta de TMDB para obtener detalles de las películas
    const tmdbMovies = await Promise.all(
      tmdbIds.map(async (tmdbId) => {
        try {
          const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=7ac73a60aa590575fb0efba44f9fe9a0&language=es`
          );
          return response.data;
        } catch (error) {
          console.error(
            `Error al obtener detalles para la película con ID ${tmdbId}:`,
            error.message
          );
          // En caso de error, devuelve null para indicar un fallo
          return null;
        }
      })
    );

    // Filtra los resultados nulos (películas que no se pudieron obtener)
    const validTmdbMovies = tmdbMovies.filter((movie) => movie !== null);

    return res.json(validTmdbMovies);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.delete("/favoritos", validateUser, async (req, res) => {
  try {
    const email = req.user.email;
    const { tmdb_id } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "No se encontró el perfil del usuario" });
    }

    const userId = user.id;

    // Eliminar de la base de datos
    const deletedFavorito = await Favorito.destroy({
      where: { user_id: userId, tmdb_id },
    });

    return res.status(201).json(deletedFavorito);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});
module.exports = router;
