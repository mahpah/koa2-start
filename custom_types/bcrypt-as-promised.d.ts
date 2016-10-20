declare module 'bcrypt-as-promised' {

	interface IBcrypt {
		genSalt(iterate: number): Promise<string>
		compare(hash1: string, hash2: string): Promise<boolean>
		hash(str: string, salt: string): Promise<string>
		MISMATCH_ERROR: any
	}

	const bcrypt: IBcrypt

	export = bcrypt
}
