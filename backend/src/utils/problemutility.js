

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

const generateCppFullCode = (code, drivercode) => {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include "json.hpp"
using json = nlohmann::json;

// --- DATA STRUCTURE DEFINITIONS ---
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

// --- UNIVERSAL BRIDGE FUNCTIONS ---
// Converts JSON array to C++ Vector
std::vector<int> jsonToVector(const json& j) {
    return j.get<std::vector<int>>();
}

// Converts JSON array to Linked List
ListNode* jsonToList(const json& j) {
    if (j.is_null() || j.empty()) return nullptr;
    ListNode* head = new ListNode(j[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < j.size(); ++i) {
        curr->next = new ListNode(j[i]);
        curr = curr->next;
    }
    return head;
}

// Converts Linked List to JSON array
json listToJson(ListNode* head) {
    json j = json::array();
    while (head) { j.push_back(head->val); head = head->next; }
    return j;
}

// --- USER SOLUTION ---
${code}

int main() {
    std::string input_json;
    // Read the entire JSON input from stdin
    if (!std::getline(std::cin, input_json) || input_json.empty()) return 0;
    
    try {
        auto input = json::parse(input_json);
        // The drivercode is dynamically injected here
        ${drivercode} 
    } catch (const std::exception& e) {
        std::cerr << "Driver Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
    `;
};

module.exports = { getLanguageConfig, generateCppFullCode };