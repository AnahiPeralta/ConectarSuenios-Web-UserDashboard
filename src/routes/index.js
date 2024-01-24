const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');

router.get('/', (req, res, next) => {
    res.render('index');
});

router.get('/index', (req, res, next) => {
    res.render('index');
});

router.get('/unite', (req, res, next) => {
    res.render('unite');
});

router.get('/quienesSomos', (req, res, next) => {
    res.render('quienesSomos');
});

router.get('/jovenes', async (req, res, next) => {
    try {
        const users = await User.find().populate('candidates');
        const candidates = users.flatMap(user => user.candidates);

        candidates.forEach(candidate => {
            if (candidate.link && candidate.link.includes('youtube.com')) {
                const videoId = obtenerVideoId(candidate.link);
                candidate.embeddedLink = `https://www.youtube.com/embed/${videoId}`;
            }
        });

        res.render('jovenes', { candidates });
    } catch (error) {
        next(error);
    }
});

function obtenerVideoId(link) {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);
    return params.get('v');
}

router.get('/form-Padr/:id/:name/:lastname', (req, res, next) => {
    const candidateId = req.params.id;
    const candidateName = decodeURIComponent(req.params.name);
    const candidateLastname = decodeURIComponent(req.params.lastname);

    res.render('form-Padr', { candidateId, candidateName,candidateLastname });
});

router.get('/contacto', (req, res, next) => {
    res.render('contacto');
});

router.get('/Form_Institucion', (req, res, next) => {
    res.render('Form_Institucion');
});

router.get('/Form_Voluntario', (req, res, next) => {
    res.render('Form_Voluntario');
});

router.get('/form-Padr', (req, res, next) => {
    res.render('form-Padr');
});


//Mostrar perfil de padrino
router.get('/perfil-pad', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const padrinos = currentUser && currentUser.padrinos ? currentUser.padrinos : [];
            res.render('perfil-pad', { padrinos: padrinos
        });
    } else {
        res.redirect('/');
    }
 } catch (err) {
    console.error(err);
    next(err);
 }
}); 

//Mostrar perfil del candidato
router.get('/perfil-cand', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const apadrinados = currentUser && currentUser.apadrinados ? currentUser.apadrinados : [];
            res.render('perfil-cand', { apadrinados: apadrinados
        });
    } else {
        res.redirect('/');
    }
 } catch (err) {
    console.error(err);
    next(err);
 }
}); 

//Seguimiento

router.get('/profilepadpad', (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const apadrinadoData = currentUser.apadrinados.length > 0 ? currentUser.apadrinados[0] : {};
            const seguimientos = currentUser.seguimientos || [];
            res.render('profilepadpad', {
                user: currentUser,
                apadrinado: apadrinadoData,
                seguimientos: seguimientos,
            });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/profilepadpad', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const {
                candidateApad,
                emailApad,
                institutionApad,
                stateApad,
                dateApad,
                stateFollow
            } = req.body;

            // Parse the date string into a JavaScript Date object
            const parsedDate = new Date(dateApad);

            // Format the date as 'YYYY-MM-DD'
            const formattedDate = parsedDate.toISOString().split('T')[0];
            
            const newSeguimiento = {
                candidateApad,
                emailApad,
                institutionApad,
                stateApad,
                dateApad: formattedDate,
                stateFollow
            };

            currentUser.seguimientos.push(newSeguimiento);
            await currentUser.save();
            res.redirect('/profilepadpad'); // Redirecciona a la página de perfil o cualquier otra página
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/add-token', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const user = req.user;
            const candidateId = req.body.token;

            let candidate;
            let institution;
            let agent;

            const allInstitutions = await User.find({ role: 'institucion' });

            // Buscar el candidato y la institución correspondiente
            for (const inst of allInstitutions) {
                const foundCandidate = inst.candidates.id(candidateId);
                if (foundCandidate) {
                    candidate = foundCandidate;
                    institution = inst.institutions[0];
                    agent = inst.agents[0]; 
                    break;
                }
            }

            if (!candidate || !institution || !agent) {
                return res.status(404).send('Candidate, institution, or agent not found');
            }

            const {
                name,
                lastname,
                dni,
                birthdate,
                age,
                email,
                tel,
                pais,
                provincia,
                provincia_alt,
                departamento,
                address,
                career,
                link,
                phrase,
                state,
            } = candidate;

            const {
                // Datos de la institución
                nameI,
                tipoI,
                orientacionI,
                paisI,
                provinciaI,
                departamentoI,
                direccionI,
            } = institution;

            const {
                nameR,
                dniR,
                telFijo,
                telMovil,
                emailR,
                position,
            } = agent;

            const newApadrinado = {
                nameCand: name,
                lastnameCand: lastname,
                dniCand: dni,
                birthdateCand: birthdate,
                ageCand: age,
                emailCand: email,
                telCand: tel,
                paisCand: pais,
                provinciaCand: provincia,
                provincia_altCand: provincia_alt,
                departamentoCand: departamento,
                addressCand: address,
                careerCand: career,
                linkCand: link,
                phraseCand: phrase,
                stateCand: state,
            
                nameI: nameI,
                tipoI: tipoI,
                orientacionI: orientacionI,
                paisI: paisI,
                provinciaI: provinciaI,
                departamentoI: departamentoI,
                direccionI: direccionI,

                nameR: nameR,
                dniR: dniR,
                telFijo: telFijo,
                telMovil: telMovil,
                emailR: emailR,
                position: position,
            };

            user.apadrinados.push(newApadrinado);
            await user.save();

            res.redirect('/profilepadpad');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/editseguimiento/:id', (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const seguimientoId = req.params.id;

            // Buscar el seguimiento en la lista del usuario por ID
            const seguimiento = currentUser.seguimientos.find(s => s.id === seguimientoId);

            if (seguimiento) {
                res.render('editseguimiento', {
                    user: currentUser,
                    seguimiento: seguimiento,
                });
            } else {
                res.redirect('/profilepadpad'); // Redirecciona si no se encuentra el seguimiento
            }
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/updateseguimiento/:id', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const seguimientoId = req.params.id;

            // Buscar el índice del seguimiento en la lista del usuario por ID
            const index = currentUser.seguimientos.findIndex(s => s.id === seguimientoId);

            if (index !== -1) {
                // Actualizar los datos del seguimiento con los nuevos valores del formulario
                currentUser.seguimientos[index].candidateApad = req.body.candidateApad;
                currentUser.seguimientos[index].emailApad = req.body.emailApad;
                currentUser.seguimientos[index].institutionApad = req.body.institutionApad;
                currentUser.seguimientos[index].stateApad = req.body.stateApad;
                currentUser.seguimientos[index].dateApad = req.body.dateApad;
                currentUser.seguimientos[index].stateFollow = req.body.stateFollow;

                await currentUser.save();
            }
        }
        res.redirect('/profilepadpad'); // Redirecciona a la página principal después de la edición
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/deleteseguimiento/:id', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const seguimientoId = req.params.id;

            // Filtra la lista de seguimientos para excluir el que se va a eliminar
            currentUser.seguimientos = currentUser.seguimientos.filter(s => s.id !== seguimientoId);

            // Guarda los cambios en la base de datos
            await currentUser.save();
        }
        res.redirect('/profilepadpad'); // Redirecciona a la página principal después de la eliminación
    } catch (err) {
        console.error(err);
        next(err);
    }
});


//Editar perfil de padrino

router.post('/edit-perfil-pad', async (req, res, next) => {
    try {
        console.log('Ingresó a la ruta /edit-perfil-pad');
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const {
                nameP,
                lastnameP,
                dniP,
                telFijo,
                telMovil,
                emailP,
                paisP,
                provinciaP,
                direccionP
            } = req.body;

            // Verificar si hay datos en padrinos
            if (currentUser.padrinos.length > 0) {
                // Actualizar la información existente
                Object.assign(currentUser.padrinos[0], {
                    nameP,
                    lastnameP,
                    dniP,
                    telFijo,
                    telMovil,
                    emailP,
                    paisP,
                    provinciaP,
                    direccionP
                });
            } else {
                currentUser.padrinos.push({
                    nameP,
                    lastnameP,
                    dniP,
                    telFijo,
                    telMovil,
                    emailP,
                    paisP,
                    provinciaP,
                    direccionP
                });
            }
            await currentUser.save();
            res.redirect('/perfil-pad');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/edit-perfil-pad', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const padrinoData = currentUser.padrinos.length > 0 ? currentUser.padrinos[0] : {};
            res.render('edit-perfil-pad', {
                user: currentUser,
                padrino: padrinoData,
            });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});



//editar perfil institucion
router.post('/edit-perfil', async (req, res, next) => {
    try {
        console.log('Ingresó a la ruta /edit-perfil');
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const {
                nameR,
                dniR,
                telFijo,
                telMovil,
                emailR,
                nameI,
                tipoI,
                orientacionI,
                paisI,
                provinciaI,
                departamentoI,
                direccionI,
                position
            } = req.body;

            // Verificar si hay datos en agents
            if (currentUser.agents.length > 0) {
                // Actualizar la información existente
                Object.assign(currentUser.agents[0], {
                    nameR,
                    dniR,
                    telFijo,
                    telMovil,
                    emailR,
                    position
                });
            } else {
                // Si no hay datos, agregar una nueva entrada
                currentUser.agents.push({
                    nameR,
                    dniR,
                    telFijo,
                    telMovil,
                    emailR,
                    position
                });
            }

            // Verificar si hay datos en institutions
            if (currentUser.institutions.length > 0) {
                // Actualizar la información existente
                Object.assign(currentUser.institutions[0], {
                    nameI,
                    tipoI,
                    orientacionI,
                    paisI,
                    provinciaI,
                    departamentoI,
                    direccionI
                });
            } else {
                // Si no hay datos, agregar una nueva entrada
                currentUser.institutions.push({
                    nameI,
                    tipoI,
                    orientacionI,
                    paisI,
                    provinciaI,
                    departamentoI,
                    direccionI
                });
            }

            await currentUser.save();
            res.redirect('/success');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/edit-perfil', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const agentData = currentUser.agents.length > 0 ? currentUser.agents[0] : {};
            const institutionData = currentUser.institutions.length > 0 ? currentUser.institutions[0] : {};
            res.render('edit-perfil', {
                user: currentUser,
                agent: agentData,
                institution: institutionData
            });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//Mostrar perfil

router.get('/perfil', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;
            const agents = currentUser && currentUser.agents ? currentUser.agents : [];
            const institutions = currentUser && currentUser.institutions ? currentUser.institutions : [];
            res.render('perfil', { agents: agents, institutions: institutions 
        });
    } else {
        res.redirect('/');
    }
 } catch (err) {
    console.error(err);
    next(err);
 }
}); //añadi el ifAutenticate

//signin y signup
 
const determineRedirect = (req) => {
    if (req.user && req.user.role === 'institucion') {
        return '/profile';
    } else if (req.user && req.user.role === 'padrino') {
        return '/profilepad';
    } else {
        return '/';
    }
};

// Función para ajustar la URL después de la redirección para padrinos
const adjustURLForPadrino = (req, redirectURL) => {
    if (req.user && req.user.role === 'padrino') {
        const adjustedURL = redirectURL.replace('/profile', '/profilepad');
        return adjustedURL;
    }
    return redirectURL;
};

router.get('/signup', (req, res, next) => {
    res.render('signup');
});

router.post('/signup', async (req, res, next) => {
    try {
        passport.authenticate('local-signup', (err, user, info) => {
            if (err) {
                console.error(err);
                return next(err);
            }

            if (!user) {
                // Si no hay usuario, redirigir a '/signup'
                return res.redirect('/signup');
            }

            // Autenticación exitosa
            req.logIn(user, (loginErr) => {
                if (loginErr) {
                    console.error(loginErr);
                    return next(loginErr);
                }

                // Redirigir según el rol
                const redirectURL = determineRedirect(req);
                const adjustedURL = adjustURLForPadrino(req, redirectURL);
                res.redirect(adjustedURL);
            });
        })(req, res, next);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/signin', (req, res, next) => {
    res.render('signin');
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('local-signin', (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }

        if (!user) {
            // Si no hay usuario, redirigir a '/signin'
            return res.redirect('/signin');
        }

        // Autenticación exitosa
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }

            // Redirigir según el rol
            const redirectURL = determineRedirect(req);
            const adjustedURL = adjustURLForPadrino(req, redirectURL);
            res.redirect(adjustedURL);
        });
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

//Cambiar contraseña

router.get('/change-password', (req, res) => {
    res.render('change-password');
});

router.post('/change-password', isAuthenticated, async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const currentUser = req.user;

        const isPasswordValid = currentUser.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.render('change-password', { error: 'Contraseña actual incorrecta' });
        }

        if (newPassword !== confirmPassword) {
            return res.render('change-password', { error: 'Las contraseñas no coinciden' });
        }

        currentUser.password = currentUser.encryptPassword(newPassword);
        await currentUser.save();

        res.render('success-pass'); // O redireccionar a una página de éxito
    } catch (error) {
        console.error(error);
        next(error);
    }
});






router.get('/success-pass', (req, res) => {
    res.render('success-pass'); // Assuming you have a change-password.ejs file in your views folder
});



router.use((req, res, next) => {
    isAuthenticated(req, res, next);
    next();
});

//profile

router.get('/profile', (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role === 'institucion') {
            return res.render('profile', { candidates: req.user.candidates });
        } else if (req.user.role === 'padrino') {
            return res.render('profilepad', { candidates: req.user.candidates });
        }
    }
    res.redirect('/');
});

router.post('/profile', (req, res, next) => {
    const registerCandidate = async (req, res, next) => {
        try {
            if (req.isAuthenticated()) {
                const currentUser = req.user;
                const {
                    name,
                    lastname,
                    dni,
                    birthdate,
                    age,
                    email,
                    tel,
                    pais,
                    provincia,
                    provincia_alt,
                    departamento,
                    address,
                    career,
                    link,
                    phrase,
                    state
                } = req.body;
    
                const newCandidate = {
                    name,
                    lastname,
                    dni,
                    birthdate,
                    age,
                    email,
                    tel,
                    pais,
                    provincia,
                    provincia_alt,
                    departamento,
                    address,
                    career,
                    link,
                    phrase,
                    state
                };
    
                currentUser.candidates.push(newCandidate);
    
                await currentUser.save();    
                res.redirect('/profile');
            } else {
                res.redirect('/');
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    };
    
    router.post('/profile', registerCandidate);
});

router.get('/success', (req, res, next) => {
    res.render('success'); 
});

router.get('/success-changed', (req, res, next) => {
    res.render('success-changed'); 
});

//editar canditato
router.post('/edit/:candidateId', async (req, res, next) => {
        try {
            if (req.isAuthenticated()) {
                const candidateId = req.params.candidateId;
                const user = req.user;
                const candidate = user.candidates.find(candidate => candidate._id.equals(candidateId));
                if (!candidate) {
                    return res.status(404).send('Candidate not found');
                }
                const updatedData = req.body;
                Object.assign(candidate, updatedData);
                await user.save();
                // Renderiza la misma página con los datos actualizados
                res.render('edit', { candidateId, candidate, user: req.user });
            } else {
                res.redirect('/');
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
});

router.get('/edit/:candidateId', (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const candidateId = req.params.candidateId;
            const candidate = req.user.candidates.find(candidate => candidate._id.equals(candidateId));
            if (!candidate) {
                return res.status(404).send('Candidate not found');
            }
            res.render('edit', { candidateId, candidate, user: req.user });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/delete/:candidateId', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const candidateId = req.params.candidateId;
            const user = req.user;

            const candidateIndex = user.candidates.findIndex(candidate => candidate._id.equals(candidateId));
            if (candidateIndex === -1) {
                return res.status(404).send('Candidate not found');
            }

            // Elimina el candidato del array
            user.candidates.splice(candidateIndex, 1);

            // Guarda los cambios en la base de datos
            await user.save();

            res.redirect('/profile');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
});

function isAuthenticated(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

module.exports = router;