<h1 align="center">env2ts</h1>
<p align="center">Simple CLI to load env variables into TypeScript</p>

---

**env2ts** is a CLI that parses your env file and generates a TypeScript file with all your variables in it.

## Usage

It can be easily used with npx.

```shell
$ npx env2ts
```

This will look for an `.env` file in your current directory and will write to `config.ts`.

## Options

| arg                     | required | description                              | default       |
| ----------------------- | -------- | ---------------------------------------- | ------------- |
| `--in path/to/.env`     | no       | Specify an `.env` file                   | `./.env`      |
| `--out path/to/file.ts` | no       | Specify the output file                  | `./config.ts` |
| `--raw`                 | no       | Print the output directly to the console | `false`       |

## Example

Consider the following `.env`

```shell
# secrets/.env

# Port
PORT=5000 # @team Do not change this!!

# AWS Config
ACCESS_KEY_ID = AF391430TEST
SECRET_ACCESS_KEY=ajg391mt1kf1036fh # Another comment

# API Config
CLIENT_ROOT=http://localhost:3000
TOKEN_SECRET=reallystrongsecret
# Keep it private
REFRESH_SECRET=anothersecretpass
```

Run **env2ts**

```sh
$ npx env2ts --in ./secrets/.env --out ./src/config/index.ts
```

**env2ts** will parse it, stripping all comments, blank lines and whitespaces.

The output will look something similar to this:

```typescript
// src/config/index.ts

import * as dotenv from "dotenv";

dotenv.config();

export const PORT: string = process.env.PORT!;
export const ACCESS_KEY_ID: string = process.env.ACCESS_KEY_ID!;
export const SECRET_ACCESS_KEY: string = process.env.SECRET_ACCESS_KEY!;
export const CLIENT_ROOT: string = process.env.CLIENT_ROOT!;
export const TOKEN_SECRET: string = process.env.TOKEN_SECRET!;
export const REFRESH_SECRET: string = process.env.REFRESH_SECRET!;
```

## Notes

**env2ts** will warn you before overwriting an existing output file

```sh
$ npx env2ts

? File 'config.ts' already exists, overwrite? › (y/N)
```

**env2ts** will prompt you to install [dotenv](https://www.npmjs.com/package/dotenv) if you happen to not have it already

```sh
$ npx env2ts

? Module dotenv is not installed, choose your package manager › - Use arrow-keys. Return to submit.
❯   npm
    yarn
    Do not install
```

## Contributing

This package is still in development. Here's a rough todo of what's left:

- [ ] Add `--js` flag to allow non-TypeScript users to use it
- [ ] Add `--require` flag to choose between `require('dotenv').config()` and ES6 Modules
- [ ] Parse env variables to get the appropriate type (now we're using string for everything)

Feel free to open a pull request adding new features or fixing bugs, but PR to the `dev` branch.

For anything else, please open an issue.
