import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';

/** @type {import("next-auth").NextAuthOptions} */
export const authOptions = {
  pages: { signIn: '/login' },
  providers: [
    // Proveedor de autenticación con credenciales
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Formulario Next Auth',
        },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials, _req) {
        console.log('Autenticando con credenciales:', credentials);

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (!res.ok) {
            console.error('Error de autenticación:', res.status);
            throw new Error('Credenciales inválidas');
          }

          const headerCookies = res.headers.getSetCookie();
          console.log('Cookies del encabezado:', headerCookies);

          const accessTokenValues = Object.fromEntries(
            (headerCookies.find((c) => c.includes('accessToken=')) || '')
              .split('; ')
              .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
          );

          // console.log('Valores de accessToken:', accessTokenValues);

          const refreshTokenValues = Object.fromEntries(
            (headerCookies.find((c) => c.includes('refreshToken=')) || '')
              .split('; ')
              .map((v) => v.split(/=(.*)/s).map(decodeURIComponent))
          );

          cookies().set({
            name: 'accessToken',
            value: accessTokenValues.accessToken,
            httpOnly: true,
            secure: process.env.NEXT_PUBLIC_ENV === 'production',
            sameSite: 'strict',
            maxAge: accessTokenValues['Max-Age'],
            path: '/',
          });

          cookies().set({
            name: 'refreshToken',
            value: refreshTokenValues.refreshToken,
            httpOnly: true,
            secure: process.env.NEXT_PUBLIC_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshTokenValues['Max-Age'],
            path: '/',
          });

          const user = await res.json();
          console.log('Usuario autenticado:', user);
          return user;

        } catch (error) {
          console.error('Error al autenticar:', error);
          throw new Error('Error de autenticación');
        }
      },
    }),

    // Proveedor de autenticación con Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user = { user: { ...MongoDB doc... }, token: 'JWT string...' }
        const userData = user.user || {};
        token.accessToken = user.token; // Token JWT de la API
        token.id = userData._id;
        token.role = userData.role;
        token.name =
          `${userData.firstname || ''} ${userData.lastname || ''}`.trim() ||
          userData.username ||
          '';
        token.image = userData.image || '';
        token.email = userData.email || '';

        // Decodificar expiración del token JWT de la API (payload.exp en segundos)
        try {
          const payload = JSON.parse(
            Buffer.from(user.token.split('.')[1], 'base64url').toString()
          );
          token.apiTokenExpires = payload.exp * 1000; // convertir a ms
        } catch {
          token.apiTokenExpires = Date.now() + 60 * 60 * 1000; // fallback 1h
        }

        delete token.error;
      }

      // En cada revalidación de sesión comprobar si el token de la API expiró
      if (token.apiTokenExpires && Date.now() > token.apiTokenExpires) {
        token.error = 'AccessTokenExpired';
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token;
      // Propagar el error de expiración para que el cliente pueda reaccionar
      if (token.error) session.error = token.error;
      return session;
    },
  },

  events: {
    async signOut() {
      cookies().delete('accessToken');
      cookies().delete('refreshToken');
    },
  },
};

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
