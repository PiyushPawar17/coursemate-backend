# Contributing Guidelines

## Setup

-   Fork Repository.

-   Clone Repository.

```sh
git clone https://github.com/{Your_Username}/coursemate-backend.git
cd coursemate-backend
```

-   Install dependencies

```sh
yarn
```

-   Setup Environment Variables
    -   Create `.env` file at the root of the project
    -   Create `.env.test` file to setup environment variables for tests

```sh
NODE_ENV=
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
COOKIE_KEY=
```

## Development

-   Run development server

```sh
yarn dev
```

## Testing

-   Run tests

```sh
yarn test
```

-   Watch tests

```sh
yarn test:watch
```

## Contributing

-   Have a look at the open issues. Pick an unassigned issue or create one.
-   Create a new branch and make changes.
-   Send a Pull Request after making changes.
