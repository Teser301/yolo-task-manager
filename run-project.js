const { execSync, exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const isWindows = os.platform() === "win32";
const backendDir = path.join(__dirname, "task-backend");
const frontendDir = __dirname;
const venvDir = path.join(backendDir, "venv");
const requirementsPath = path.join(backendDir, "requirements.txt");

function log(msg) {
  console.log("[Setup]", msg);
}

function error(msg) {
  console.error("❌", msg);
}

function success(msg) {
  console.log("✅", msg);
}

function checkDirectories() {
  log("Checking project structure...");

  if (!fs.existsSync(backendDir)) {
    error(`Backend directory not found: ${backendDir}`);
    return false;
  }

  const mainPyPath = path.join(backendDir, "main.py");
  if (!fs.existsSync(mainPyPath)) {
    error(`main.py not found in task-backend directory`);
    return false;
  }

  const frontendPackageJson = path.join(frontendDir, "package.json");
  if (!fs.existsSync(frontendPackageJson)) {
    error(`Frontend package.json not found in root directory`);
    return false;
  }

  success("Project directories validated");
  return true;
}

function createVenvIfNeeded() {
  if (!fs.existsSync(venvDir)) {
    log("Creating virtual environment...");
    try {
      execSync(`python -m venv venv`, { cwd: backendDir, stdio: "inherit" });
      success("Virtual environment created");
    } catch (err) {
      error(
        "Failed to create virtual environment. Make sure Python is installed and in PATH"
      );
      throw err;
    }
  } else {
    log("Virtual environment already exists.");
  }
}

function installRequirements() {
  const pipPath = isWindows
    ? path.join(venvDir, "Scripts", "pip.exe")
    : path.join(venvDir, "bin", "pip");

  if (!fs.existsSync(pipPath)) {
    error("pip not found in venv!");
    process.exit(1);
  }

  const installCmd = fs.existsSync(requirementsPath)
    ? `"${pipPath}" install -r requirements.txt`
    : `"${pipPath}" install fastapi uvicorn`;

  log("Installing backend dependencies...");
  try {
    execSync(installCmd, { cwd: backendDir, stdio: "inherit" });
    success("Backend dependencies installed");
  } catch (err) {
    error("Failed to install backend dependencies");
    throw err;
  }
}

function startBackend() {
  const pythonPath = isWindows
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");

  log("Starting backend server in background...");

  // Start backend in background without opening new terminal
  const child = spawn(
    pythonPath,
    [
      "-m",
      "uvicorn",
      "main:app",
      "--reload",
      "--host",
      "0.0.0.0",
      "--port",
      "8000",
    ],
    {
      cwd: backendDir,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  // Show backend output
  child.stdout.on("data", (data) => {
    console.log("[Backend]", data.toString().trim());
  });

  child.stderr.on("data", (data) => {
    console.error("[Backend]", data.toString().trim());
  });

  child.on("error", (err) => {
    error("Backend failed to start:", err.message);
  });

  child.unref(); // Allow parent to exit independently

  success("Backend server starting on http://localhost:8000");
  return child;
}

function installFrontendDeps() {
  return new Promise((resolve, reject) => {
    log("Installing frontend dependencies...");

    const child = exec("npm install", { cwd: frontendDir });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("close", (code) => {
      if (code === 0) {
        success("Frontend dependencies installed");
        resolve();
      } else {
        error(`Frontend dependency installation failed with code ${code}`);
        reject(new Error(`npm install failed with code ${code}`));
      }
    });

    child.on("error", (err) => {
      error("Failed to run npm install:", err.message);
      reject(err);
    });
  });
}

function startFrontend() {
  log("Starting frontend development server...");

  const child = exec("npm start", { cwd: frontendDir });

  child.stdout.on("data", (data) => {
    console.log("[Frontend]", data.toString().trim());
  });

  child.stderr.on("data", (data) => {
    console.error("[Frontend]", data.toString().trim());
  });

  child.on("error", (err) => {
    error("Failed to start frontend:", err.message);
  });

  success("Frontend server starting...");
  return child;
}

async function main() {
  try {
    log("Starting setup process...");

    if (!checkDirectories()) {
      process.exit(1);
    }

    // Setup backend
    createVenvIfNeeded();
    installRequirements();
    const backendProcess = startBackend();

    // Wait for backend to initialize
    log("Waiting for backend to initialize...");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Setup and start frontend
    await installFrontendDeps();
    const frontendProcess = startFrontend();

    success("Setup complete! Both servers are running.");
    log("Backend API: http://localhost:8000");
    log("Backend docs: http://localhost:8000/docs");
    log("Frontend will start shortly...");

    // Keep the script running to show logs
    process.on("SIGINT", () => {
      log("Shutting down servers...");
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    error("Setup failed:", error.message);
    process.exit(1);
  }
}

main();
