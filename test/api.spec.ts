require('dotenv').config();

// @ts-ignore
import request from 'supertest';
import { expect } from 'chai';

const baseUrl = 'https://gorest.co.in/public/v2';  // Базовий URL для GoRest API
let createdUserId = null;

describe('GoRest API Tests', () => {
  it('should fetch all users', async () => {
    const response = await request(baseUrl)
      .get('/users')
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .expect(200);

    expect(response.body).to.be.instanceof(Array);
  });

  it('should error create a user with taken email', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      gender: 'male',
      status: 'active'
    };

    const response = await request(baseUrl)
      .post('/users')
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .send(newUser)
      .expect(422);

    expect(response.body).to.be.deep.equal([{
      field: "email",
      message: "has already been taken",
    }]);
  });

  it('should create a new user', async () => {
    const newUser = {
      name: 'John Doe',
      email: `johndoe${Math.random().toFixed(16)}@example.com`,
      gender: Math.random() > 0.5 ? 'female' : 'male',
      status: 'active'
    };

    const response = await request(baseUrl)
      .post('/users')
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .send(newUser)
      .expect(201);

    expect(response.body).to.be.an('object');
    expect(response.body).to.include.keys('id');  // Перевіряємо, що є поле id

    expect(response.body.name).to.equal(newUser.name);
    expect(response.body.email).to.equal(newUser.email);
    expect(response.body.gender).to.equal(newUser.gender);
    expect(response.body.status).to.equal(newUser.status);

    expect(response.body.id).to.be.a('number');

    createdUserId = response.body.id;
  });

  it('should get created user', async () => {
    const response = await request(baseUrl)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .expect(200);

    expect(response.body.id).to.equal(createdUserId);
  });

  it('should update a user', async () => {
    const updatedUser = {
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      gender: 'female',
      status: 'inactive'
    };

    const response = await request(baseUrl)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .send(updatedUser)
      .expect(200);

    expect(response.body.name).to.equal(updatedUser.name);
  });

  it('should delete a user', async () => {
    const response = await request(baseUrl)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .expect(204);
  });

  it('should return 404 on deleted user', async () => {
    const response = await request(baseUrl)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${process.env.GOREST_TOKEN}`)
      .expect(404);
  });
});
