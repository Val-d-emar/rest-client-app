export class UserCookieManager {
  private static readonly COOKIE_NAME = 'userId';
  private static readonly MAX_AGE_DAYS = 365;

  static setUserId(userId: string): void {
    const maxAge = 60 * 60 * 24 * this.MAX_AGE_DAYS;
    const cookieString = `${this.COOKIE_NAME}=${userId}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = cookieString;
  }

  static removeUserId(): void {
    document.cookie = `${this.COOKIE_NAME}=; path=/; max-age=0`;
  }

  static getUserId(): string | null {
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find((cookie) => cookie.trim().startsWith(`${this.COOKIE_NAME}=`));

    if (userCookie) {
      return userCookie.split('=')[1];
    }

    return null;
  }

  static hasValidUserId(): boolean {
    return this.getUserId() !== null;
  }
}
