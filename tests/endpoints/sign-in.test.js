import { PrismaClient, Prisma } from '@prisma/client'
import request from "supertest"
import app from "../../app.js"

async function cleanupDatabase() {
  const prisma = new PrismaClient();
  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

  return Promise.all(
    modelNames.map((modelName) => prisma[modelName.toLowerCase()].deleteMany())
  );
}

describe("POST /users", () => {
    const user = {
      name: 'John',
      email: 'john9@example.com',
      password: 'insecure',
    }
  
    beforeAll(async () => {
      await cleanupDatabase()
  
    })
  
    afterAll(async () => {
      await cleanupDatabase()
    })

    it("accessToken Is returned", async () => {    
        const response = await request(app)
          .post("/sign-in")
          .send(user)
          .set('Accept', 'application/json')
        // expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeTruthy;
      });

      it("wrong email return to 401", async () => {    
        const user2 = {
            name: 'John',
            email: 'hello@gmail.com',
            password: 'insecure',
        }
        
        const response = await request(app)
          .post("/sign-in")
          .send(user2)
          .set('Accept', 'application/json')
        expect(response.statusCode).toBe(401);
        expect(response.body.accessToken).toBe(undefined);
      });

      it("wrong password should return to 401", async () => {    
        const user3 = {
            name: 'John',
            email: 'john9@example.com',
            password: 'insecurity',
        }
        
        const response = await request(app)
          .post("/sign-in")
          .send(user3)
          .set('Accept', 'application/json')
        expect(response.statusCode).toBe(401);
        expect(response.body.accessToken).toBe(undefined);
      });
})