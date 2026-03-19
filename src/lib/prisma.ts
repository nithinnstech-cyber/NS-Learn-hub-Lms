import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const caCert = `-----BEGIN CERTIFICATE-----
MIIERDCCAqygAwIBAgIUGrUcx7AckWmhtfSah/5OJ3HumQcwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvOWEyODgxMGQtNGExZC00MzM1LThiZGQtMzI1MDYxZjFl
NDQ3IFByb2plY3QgQ0EwHhcNMjYwMzE2MTgyMzExWhcNMzYwMzEzMTgyMzExWjA6
MTgwNgYDVQQDDC85YTI4ODEwZC00YTFkLTQzMzUtOGJkZC0zMjUwNjFmMWU0NDcg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKU/nRoM
H3LstDPgYhyQfgjO9YuHWk02zutMxWqCqBoDBJm3Y45Grgl1GYZQbOssXM0QTuX/
rDXV8HErswMii4TdMkoXW1ZVqDdRo2jEuAB1my/QwY4hWzaABsY2XKr9baBOe8Xe
8wLcPcic7bOWYxRjtkYPfpQWZOf01sSsBga+Xhn9sXXpdeLljn8YNGT2F53xA7JZ
FqT+aK0oozxZ+dwGE72fSI98FxEEfvczpnVxOW2tzE8IWGp1NdoDl95o2Vr6Ic71
XN8ZJe9sgGwFlAHB1pN2G0pl5xYIizZtC04XRXVczfeLPexXdbZHSUGaFJndJ7ep
/lFx0a0SeFzZEbwNr020aEnEkgkcic4x/wRYmzbD9xjcIK1p8TJcoz4D2Ts1bQhC
LYBgizKH2CkRSCFxzsRsW3rABnBhlKt65BwQhUeUe5DBAlf67POiHXa8NRUXCxEU
Fu5dAZwP53XdeH+vhwkrCEyDcwI0uJnQuwygXJxqrq2xfoCKtwtOZ42gwwIDAQAB
o0IwQDAdBgNVHQ4EFgQURbr/Zy7zeG0F1g5D5N1ikdt/qOkwEgYDVR0TAQH/BAgw
BgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAJCg8T4OQ9/P
WpORRmfpB1gQNnre6gz1+t7/nrOL2v71dHGeD0/3x94G+CHGXWZBGfOZZe7687Pu
jDOIplnShs1wSX8PeUDl4BN0q6cxtaGA8t4dw/3LujYpAIog1VPpEDuqEVuqIpYN
s93obX8tGjZFoHfcwHg2GexBBO+RSj3Zu3kFNckGnrEc7L+Qx5+eDhgBWItro1n8
jEm8oA+n1ywu8GxBAlGqqCm10vyumQdg3qwzHC4WzXt4KKvGFmKAYBnAD1a8t831
Kd1KzEjnNTcCqyKLpbhU3SfWFzn3UDZ/jY0NhM6XkXJWcbvHV/1b0YVEciL1bw+u
RcUZA7j2e1goTzBEkuSSewRBNAKEF/JPc2F1T6ORlxhFA/76+L2VtiSwbyhYmpUp
rsJDLD6YLY9NkbMYZyWEsMTvmO8JzGLSYwmm4JFImwZa3XhYsSY5kJqRjtilCqS2
CD6rHAD+MdHD/CHsGVxl8VyfV9zAVGfLCAf6qA4DInGsSolwiA49Vw==
-----END CERTIFICATE-----`;

const adapter = new PrismaMariaDb({
  host: 'mysql-1b431af-nithinns-e902.j.aivencloud.com',
  port: 10863,
  user: 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: 'defaultdb',
  ssl: {
    ca: caCert,
  },
  connectionLimit: 3,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error'],
  });


if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
