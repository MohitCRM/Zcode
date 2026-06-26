

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
#include <unordered_set>
#include <unordered_map>
#include <climits>
#include <queue>
#include <cmath>
#include "json.hpp"

using json = nlohmann::json;
using namespace std;

// --- DATA STRUCTURE DEFINITIONS ---
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

// --- UNIVERSAL BRIDGE FUNCTIONS ---
std::vector<int> jsonToVector(const json& j) { return j.get<std::vector<int>>(); }

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

json listToJson(ListNode* head) {
    json j = json::array();
    while (head) { j.push_back(head->val); head = head->next; }
    return j;
}

// Converts JSON array (Level Order) to Binary Tree
TreeNode* jsonToTree(const json& j) {
    if (j.is_null() || j.empty() || j[0].is_null()) return nullptr;
    TreeNode* root = new TreeNode(j[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < j.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < j.size() && !j[i].is_null()) {
            curr->left = new TreeNode(j[i]);
            q.push(curr->left);
        }
        i++;
        if (i < j.size() && !j[i].is_null()) {
            curr->right = new TreeNode(j[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

json treeToJson(TreeNode* root) {
    if (!root) return json::array();
    json j = json::array();
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) {
            j.push_back(curr->val);
            q.push(curr->left);
            q.push(curr->right);
        } else {
            j.push_back(nullptr);
        }
    }
    while (j.size() > 0 && j.back().is_null()) {
        j.erase(j.size() - 1);
    }
    return j;
}

// Converts JSON 2D array to C++ 2D vector
std::vector<std::vector<char>> jsonToGrid(const json& j) {
    std::vector<std::vector<char>> grid;
    for (const auto& row : j) {
        std::vector<char> charRow;
        for (const auto& val : row) {
            // Converts JSON string or int to char
            charRow.push_back(val.get<std::string>()[0]);
        }
        grid.push_back(charRow);
    }
    return grid;
}

// --- USER SOLUTION ---
${code}

int main() {
    std::string input_json;
    if (!std::getline(std::cin, input_json) || input_json.empty()) return 0;
    
    try {
        auto input = json::parse(input_json);
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