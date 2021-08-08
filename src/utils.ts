import chalk from "chalk";
import spawn from "cross-spawn";
import fs from "fs";

interface IPackageJSON {
  devDependencies?: {
    dotenv?: string;
  };
  dependencies?: {
    dotenv?: string;
  };
}

export const isDotenvInstalled = () => {
  let installed = false;

  try {
    const packageJson: IPackageJSON = JSON.parse(
      fs.readFileSync("./package.json").toString()
    );

    if (!packageJson) {
      throw new Error("");
    }

    if (
      packageJson.devDependencies?.dotenv ||
      packageJson.dependencies?.dotenv
    ) {
      installed = true;
    }
  } catch {}

  return installed;
};

enum Manager {
  npm = "npm",
  yarn = "yarn",
  none = "none",
}

export const installDotenv = (manager: Manager): Promise<string> => {
  return new Promise((resolve, reject) => {
    let depsCommand = "";
    const depsArgs: string[] = [];

    switch (manager) {
      case "npm":
        depsCommand = "npm";
        depsArgs.push(...["install", "dotenv"]);
        break;
      case "yarn":
        depsCommand = "yarn";
        depsArgs.push(...["add", "dotenv"]);
        break;
      case "none":
      default:
        break;
    }

    if (depsCommand && depsArgs) {
      console.log("\n");

      const child = spawn(depsCommand, depsArgs, {
        stdio: "inherit",
      });

      child.on("close", (code) => {
        if (code !== 0) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ command: `${depsCommand} ${depsArgs.join(" ")}` });
          return;
        }

        resolve(
          `\n${chalk.green("✔")} Successfully installed ${chalk.cyan("dotenv")}`
        );
      });
    } else {
      resolve(
        `\n${chalk.green("✔")} Skipping ${chalk.cyan("dotenv")} installation`
      );
    }
  });
};

export const parseEnvFile = (contents: string): string[] => {
  let rawContent = contents;

  // Remove comments
  rawContent = rawContent.replace(/#.*/gm, "");

  // Remove blank lines
  rawContent = rawContent.replace(/(^[ \t]*\n)/gm, "");

  console.log(`${chalk.blue("➤")} Collecting env variables`);

  // Get an array of the vars without the value and trim whitespace
  const varArr = rawContent.match(/^([^=])+/gm)?.map((v) => v.trim());

  return varArr || [];
};
