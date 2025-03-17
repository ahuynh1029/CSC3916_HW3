let envPath = __dirname + "/../.env"
require('dotenv').config({path:envPath});
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../models/Users');
let Movie = require('../models/Movies');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'test2',
    username: 'email2@email.com',
    password: '123@abc'
}

let movie_details = {
    title: 'Alice in Wonderland',
    releaseDate: 2010,
    genre: 'Fantasy',
    actors: [ { actorName: 'Mia Wasikowska', characterName: 'Alice Kingsleigh' }, { actorName: 'Johnny Depp', characterName: 'Mad Hatter' }, { actorName: 'Helena Bonham Carter', characterName: 'Red Queen' } ]
}

let token = ''

describe('Test Movie Routes', () => {
   before((done) => {
        User.deleteOne({ name: 'test2'}, function(err, user) {
            if (err) throw err;
        });
       
        Movie.deleteOne({ title: 'Alice in Wonderland'}, function(err, user) {
            if (err) throw err;
        });
       done();
    })

    after((done) => { 
        User.deleteOne({ name: 'test2'}, function(err, user) {
            if (err) throw err;
        });
       
        Movie.deleteOne({ title: 'Alice in Wonderland'}, function(err, user) {
            if (err) throw err;
        });
        done();
    })

    describe('/signup', () => {
        it('it should register, login and check our token', (done) => {
          chai.request(server)
              .post('/signup')
              .send(login_details)
              .end((err, res) =>{
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
        
                chai.request(server)
                    .post('/signin')
                    .send(login_details)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('token');
                        token = res.body.token;
                        done();
                    })
              })
        })
    });

    describe('POST Movies', () => {
        it('it return all movies', (done) => {
            chai.request(server)
                .post('/movies')
                .set('Authorization', token)
                .send(movie_details)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });

    describe('GET Movies', () => {
        it('it return all movies', (done) => {
            chai.request(server)
                .get('/movies')
                .set('Authorization', token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.forEach(movie => {
                        movie.should.have.property('title')
                        movie.should.have.property('releaseDate')
                        movie.should.have.property('genre')
                        movie.should.have.property('actors')
                    });
                    done();
                })
        })
    });
});