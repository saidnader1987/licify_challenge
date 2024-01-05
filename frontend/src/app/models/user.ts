export enum UserRole {
  CONSTRUCTOR = 'constructor',
  SUPPLIER = 'proveedor',
  ADMIN = 'admin',
}

export class User {
  constructor(
    public email: string,
    public _id: string,
    public role: UserRole,
    public name: string,
    public company: string,
    public password?: string,
    public passwordConfirm?: string,
    private _token?: string,
    private _tokenExpirationDate?: Date
  ) {}

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate)
      return null;
    return this._token;
  }
}
