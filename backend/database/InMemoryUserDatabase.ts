import type {
	RegisterUserData,
	UpdateUserData,
	User,
	UserCredentials,
} from "../users/UserRegister";

export class InMemoryUserDatabase {
	private readonly users = new Map<string, User>();

	async register(data: RegisterUserData): Promise<User> {
		const email = this.normalizeEmail(data.email);

		if (this.hasEmail(email)) {
			throw new Error("A user with that email already exists.");
		}

		const now = new Date().toISOString();
		const user: User = {
			id: crypto.randomUUID(),
			name: data.name.trim(),
			email,
			passwordHash: this.createToyPasswordHash(data.password),
			createdAt: now,
			updatedAt: now,
		};

		this.users.set(user.id, user);
		return this.copyUser(user);
	}

	async existsById(id: string): Promise<boolean> {
		return this.users.has(id);
	}

	async existsByEmail(email: string): Promise<boolean> {
		return this.hasEmail(this.normalizeEmail(email));
	}

	async findById(id: string): Promise<User | null> {
		const user = this.users.get(id);
		return user ? this.copyUser(user) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const normalizedEmail = this.normalizeEmail(email);
		const user = [...this.users.values()].find(
			(storedUser) => storedUser.email === normalizedEmail,
		);

		return user ? this.copyUser(user) : null;
	}

	async verifyCredentials(
		credentials: UserCredentials,
	): Promise<User | null> {
		const user = await this.findByEmail(credentials.email);

		if (!user || user.passwordHash !== this.createToyPasswordHash(credentials.password)) {
			return null;
		}

		return user;
	}

	async update(id: string, data: UpdateUserData): Promise<User | null> {
		const user = this.users.get(id);

		if (!user) {
			return null;
		}

		if (data.email !== undefined) {
			const email = this.normalizeEmail(data.email);
			const emailAlreadyUsed = [...this.users.values()].some(
				(storedUser) => storedUser.id !== id && storedUser.email === email,
			);

			if (emailAlreadyUsed) {
				throw new Error("A user with that email already exists.");
			}

			user.email = email;
		}

		if (data.name !== undefined) {
			user.name = data.name.trim();
		}

		if (data.password !== undefined) {
			user.passwordHash = this.createToyPasswordHash(data.password);
		}

		user.updatedAt = new Date().toISOString();
		return this.copyUser(user);
	}

	async delete(id: string): Promise<boolean> {
		return this.users.delete(id);
	}

	private hasEmail(email: string): boolean {
		return [...this.users.values()].some((user) => user.email === email);
	}

	private normalizeEmail(email: string): string {
		return email.trim().toLowerCase();
	}

	private createToyPasswordHash(password: string): string {
		return `toy-hash:${password}`;
	}

	private copyUser(user: User): User {
		return { ...user };
	}
}

export const userDatabase = new InMemoryUserDatabase();
