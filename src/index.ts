#! /usr/bin/env node

import fs from "fs";
import chalk from "chalk";
import { installDotenv, isDotenvInstalled, parseEnvFile } from "./utils";
import prompts from "prompts";
import chokidar from "chokidar";
import logUpdate from "log-update";

const executeRegular = (input: string, output: string) => {
  // Start the magic
  console.log(`${chalk.blue("➤")} Reading env variables`);

  if (fs.existsSync(input)) {
    console.log(`${chalk.blue("➤")} Reading ${chalk.cyan(input)} contents`);
    // Get file contents
    const rawContent = fs.readFileSync(input).toString();

    console.log(`${chalk.blue("➤")} Parsing ${chalk.cyan(input)} contents`);

    const varArr = parseEnvFile(rawContent);

    console.log(
      `${chalk.blue("➤")} Preparing ${varArr?.length || 0} variables`
    );

    // Prepare data to be written
    let configContent = `import * as dotenv from 'dotenv';\n\ndotenv.config();\n\n`;
    varArr?.forEach((v) => {
      const str = `export const ${v}: string = process.env.${v}!;\n`;
      configContent += str;
    });

    if (!output) {
      // Spit raw
      console.log(`\n${chalk.green("✔")} Successfully parsed variables.\n\n`);
      console.log(configContent);
      process.exit(0);
    } else {
      // Write file
      fs.writeFile(output, configContent, (error) => {
        if (error) {
          console.log(error);
          console.log(`\n${chalk.red("✖")} Failed to write to ${output}`);
          process.exit(1);
        }

        console.log(
          `\n${chalk.green("✔")} Successfully added variables to ${chalk.cyan(
            output
          )}`
        );

        process.exit(0);
      });
    }
  } else {
    // Output file doesn't exist
    console.log(
      `\n${chalk.red(
        "✖"
      )} Couldn't find ${input} file. Specify one with ${chalk.cyan(
        "--in path/to/.env"
      )}`
    );
  }
};

const executeWatch = (input: string, output: string) => {
  if (fs.existsSync(input)) {
    logUpdate(`${chalk.blue("➤")} Reading ${chalk.cyan(input)} contents`);

    // Get file contents
    const rawContent = fs.readFileSync(input).toString();

    logUpdate(`${chalk.blue("➤")} Parsing ${chalk.cyan(input)} contents`);

    const varArr = parseEnvFile(rawContent);

    logUpdate(`${chalk.blue("➤")} Preparing ${varArr?.length || 0} variables`);

    // Prepare data to be written
    let configContent = `import * as dotenv from 'dotenv';\n\ndotenv.config();\n\n`;
    varArr?.forEach((v) => {
      const str = `export const ${v}: string = process.env.${v}!;\n`;
      configContent += str;
    });

    // Write file
    fs.writeFile(output, configContent, (error) => {
      if (error) {
        logUpdate.done();
        console.log(error);
        console.log(`\n${chalk.red("✖")} Failed to write to ${output}`);
        process.exit(1);
      }
      logUpdate(
        `${chalk.green("✔")} Successfully added variables to ${chalk.cyan(
          output
        )}`
      );
    });
  } else {
    // Output file doesn't exist
    logUpdate.done();
    console.log(
      `\n${chalk.red(
        "✖"
      )} Couldn't find ${input} file. Specify one with ${chalk.cyan(
        "--in path/to/.env"
      )}`
    );
  }
};

const main = async () => {
  const args = process.argv.slice(2, process.argv.length);

  const input =
    args.indexOf("--in") !== -1 ? args[args.indexOf("--in") + 1] : ".env";

  const raw = args.indexOf("--raw") !== -1;

  let output = "";
  if (raw) {
    output = "";
  } else if (args.indexOf("--out") !== -1) {
    output = args[args.indexOf("--out") + 1];
  } else {
    output = "config.ts";
  }

  const watch = args.indexOf("--watch") !== -1;

  if (watch && raw) {
    console.log(`\n${chalk.red("✖")} --watch and --raw can't be used together`);

    process.exit(1);
  }

  console.log("\n");

  // Check if dotenv is installed and throw a warning if not
  if (!isDotenvInstalled() && !raw) {
    const dotenvInstall = await prompts({
      type: "select",
      name: "manager",
      message: `Looks like ${chalk.cyan(
        "dotenv"
      )} is not installed, choose your package manager or skip install`,
      choices: [
        {
          title: "Do not install",
          value: "none",
        },
        {
          title: "npm",
          value: "npm",
        },
        {
          title: "yarn",
          value: "yarn",
        },
      ],
    });

    try {
      const installRes = await installDotenv(dotenvInstall.manager);
      console.log(`\n${installRes}`);
    } catch (error) {
      console.log(
        `\n${chalk.red("✖")} Command ${chalk.cyan(error.command)} failed.`
      );
      process.exit(1);
    }
  }

  // If output file exists, ask for overwrites
  if (fs.existsSync(output) && !raw) {
    const overwrite = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `File '${chalk.cyan(output)}' already exists, ${chalk.red(
        "overwrite"
      )}?`,
    });

    if (!overwrite.overwrite) {
      console.log(
        `\n${chalk.red("✖")} Specify an output file with ${chalk.cyan(
          "--out path/to/file.ts"
        )} to avoid overwrites.`
      );
      process.exit(1);
    }
  }

  if (!watch) {
    return executeRegular(input, output);
  }

  console.log(`${chalk.blue("➤")} Starting watch mode`);

  chokidar
    .watch(input, {
      persistent: true,
      awaitWriteFinish: true,
    })
    .on("change", () => executeWatch(input, output));
};

main();
