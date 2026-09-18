import { userDatabase } from "../database/InMemoryUserDatabase";

export interface User {
	id: string;
	name: string;
	email: string;
	passwordHash: string;
	createdAt: string;
	updatedAt: string;
}

export interface RegisterUserData {
	name: string;
	email: string;
	password: string;
}

export interface UserCredentials {
	email: string;
	password: string;
}

export interface UpdateUserData {
	name?: string;
	email?: string;
	password?: string;
}

/** Registra un usuario nuevo y genera sus datos internos automáticamente. */
export async function registerUser(data: RegisterUserData): Promise<User> {
	return userDatabase.register(data);
}

/** Confirma si existe un usuario con el ID indicado. */
export async function userExistsById(id: string): Promise<boolean> {
	return userDatabase.existsById(id);
}

/** Confirma si ya existe un usuario registrado con ese email. */
export async function userExistsByEmail(email: string): Promise<boolean> {
	return userDatabase.existsByEmail(email);
}

/** Busca un usuario por ID; devuelve null si no existe. */
export async function getUserById(id: string): Promise<User | null> {
	return userDatabase.findById(id);
}

/** Busca un usuario por email; devuelve null si no existe. */
export async function getUserByEmail(email: string): Promise<User | null> {
	return userDatabase.findByEmail(email);
}

/** Comprueba el email y la contraseña para iniciar sesión. */
export async function verifyCredentials(
	credentials: UserCredentials,
): Promise<User | null> {
	return userDatabase.verifyCredentials(credentials);
}

/** Actualiza los datos indicados de un usuario existente. */
export async function updateUser(
	id: string,
	data: UpdateUserData,
): Promise<User | null> {
	return userDatabase.update(id, data);
}

/** Elimina un usuario y devuelve si la operación encontró ese usuario. */
export async function deleteUser(id: string): Promise<boolean> {
	return userDatabase.delete(id);
}
