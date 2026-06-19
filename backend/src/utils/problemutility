

const getLanguageConfig = (lang) => {
    const configs = {
        "c++": { ext: "cpp", compile: "g++ -O2 main.cpp -o main", run: "./main" },
        "java": { ext: "java", compile: "javac main.java", run: "java main" },
        "python": { ext: "py", compile: null, run: "python3 main.py" },
        "javascript": { ext: "js", compile: null, run: "node main.js" },
        "c": { ext: "c", compile: "gcc -O2 main.c -o main", run: "./main" },
        "go": { ext: "go", compile: "go build -o main main.go", run: "./main" },
        "ruby": { ext: "rb", compile: null, run: "ruby main.rb" },
        "php": { ext: "php", compile: null, run: "php main.php" }
    };
    return configs[lang.toLowerCase()] || configs["c++"];
};

module.exports = {  getLanguageConfig };