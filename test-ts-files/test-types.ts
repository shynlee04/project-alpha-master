// Test TypeScript file for Serena
export interface TestUser {
  id: string;
  name: string;
  email: string;
}

export class TestService {
  private users: TestUser[] = [];
  
  addUser(user: TestUser): void {
    this.users.push(user);
  }
  
  getUser(id: string): TestUser | undefined {
    return this.users.find(user => user.id === id);
  }
}

export const testConstant = "Hello Serena!";
