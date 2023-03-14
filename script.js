let algorithm="global";
const global_btn = document.getElementById("global-btn");
global_btn.addEventListener("click", function() {algorithm="global"; NW()});

const local_btn = document.getElementById("local-btn");
local_btn.addEventListener("click", function() {algorithm="local"; SW()});

const seq1_box = document.getElementById("sequence1");
const seq2_box = document.getElementById("sequence2");
const match_box = document.getElementById("match-score");
const mismatch_box = document.getElementById("mismatch-score");
const gap_box = document.getElementById("gap-score");
seq1_box.addEventListener("input", function() {algorithm == "global" ? NW() : SW();});
seq2_box.addEventListener("input", function() {algorithm == "global" ? NW() : SW();});
match_box.addEventListener("input", function() {algorithm == "global" ? NW() : SW();});
mismatch_box.addEventListener("input", function() {algorithm == "global" ? NW() : SW();});
gap_box.addEventListener("input", function() {algorithm == "global" ? NW() : SW();});


class Table {
    constructor(height, width) {
        this.height = height + 1;
        this.width = width + 1;
        this.table = new Array(this.height)
        for (var i=0; i<this.height; i++) {
            this.table[i] = new Array(this.width)
        }
    }
}

function DFS_d(dir, i, j, path1, path2, paths) {
    let seq1 = document.getElementById("sequence1").value;
    let seq2 = document.getElementById("sequence2").value;

    let directions = dir[i][j];
    if (directions == null) {
        paths.push([path1.split("").reverse().join(""), path2.split("").reverse().join("")]);
        return paths;
    }

    for (let ii=0; ii<directions.length; ii++) {
        switch (directions[ii]) {
            case "diagonal":
                paths = DFS_d(dir, i-1, j-1, path1 + seq1[i-1], path2 + seq2[j-1], paths);
                break;
            case "left":
                paths = DFS_d(dir, i, j-1, path1 + "-", path2 + seq2[j-1], paths);
                break;
            case "up":
                paths = DFS_d(dir, i-1, j, path1 + seq1[i-1], path2 + "-", paths);
                break;
        }
    }
    return paths;
}

function DFS_b(dir, i, j, visited) {
    visited.push([i, j]);
    let directions = dir[i][j];
    if (directions == null) {
        return visited;
    }
    for (let ii=0; ii<directions.length; ii++) {
        switch (directions[ii]) {
            case "diagonal":
                visited = DFS_b(dir, i-1, j-1, visited);
                break;
            case "left":
                visited = DFS_b(dir, i, j-1, visited);
                break;
            case "up":
                visited = DFS_b(dir, i-1, j, visited);
                break;
        }
    }
    return visited;

}

function NW() {
    // init
    let seq1 = document.getElementById("sequence1").value;
    let seq2 = document.getElementById("sequence2").value;

    let match = +document.getElementById("match-score").value;
    let mismatch = +document.getElementById("mismatch-score").value;
    let gap = +document.getElementById("gap-score").value;

    let matrix = new Table(seq1.length, seq2.length).table;
    let dir = new Table(seq1.length, seq2.length).table;

    // Set gap for first row
    for (var i=0; i<matrix[0].length; i++) { matrix[0][i] = i * gap; }
    for (var i=1; i<dir[0].length; i++) { dir[0][i] = ["left"] }

    // Set gap for first column
    for (var i=0; i<matrix.length; i++) { matrix[i][0] = i * gap; }
    for (var i=1; i<dir.length; i++) { dir[i][0] = ["up"]; }

    // Main algorithm
    for (var i=0; i<seq1.length; i++) {
        for (var j=0; j<seq2.length; j++) {
            let matching = seq1[i] == seq2[j] ? match : mismatch;

            let diagonal = matrix[i][j] + matching;
            let left = matrix[i+1][j] + gap;
            let up = matrix[i][j+1] + gap;

            best = Math.max(diagonal, left, up);
            dir[i+1][j+1] = [];
            if (best == diagonal) {
                dir[i+1][j+1].push("diagonal");
            }
            if (best == left) {
                dir[i+1][j+1].push("left");
            }
            if (best == up) {
                dir[i+1][j+1].push("up");
            }

            matrix[i+1][j+1] = best;
        }
    }

    // Backtrack and show best sequence
    let alignments = DFS_d(dir, seq1.length, seq2.length, "", "", []);
    let bests = DFS_b(dir, seq1.length, seq2.length, []);
    let score = matrix[seq1.length][seq2.length];



    
    // Verbose ugly part where I have to directly deal with the DOM
    let score_str = "Score: <b>" + score + "</b>";
    document.getElementById("score").innerHTML = score_str;

    let alignments_str = ""
    alignments.forEach(function(alignment) {
        alignments_str += alignment[0] + "\n";
        alignments_str += alignment[1] + "\n";
        alignments_str += "\n";
    })
    document.getElementById("alignments").innerHTML = alignments_str;

    // Matrix visualization part
    for (let i=0; i<matrix.length; i++) {
        if (i==0) {
            matrix[i].unshift("");
        } else{
            matrix[i].unshift(seq1[i-1])
        }
    }
    let header = seq2.split("");
    header.unshift("", "");
    matrix.unshift(header);

    document.getElementById("matrix-body").innerHTML = "";
    document.getElementById("matrix-body").style.gridTemplateColumns = "repeat(" + header.length + ", 1fr)";
    let cell;
    let value;
    let directions;
    let direction;
    for (let i=0; i<matrix.length; i++) {
        for (let j=0; j<matrix[i].length; j++) {
            cell = document.createElement("div");
            cell.classList.add("cell-container")
            if (i==0) {cell.classList.add("top-edge");}
            if (j==0) {cell.classList.add("left-edge");}

            value = document.createElement("div");
            value.innerHTML = matrix[i][j];
            value.classList.add("value");
            cell.appendChild(value)

            if ((i > 0) && (j > 0)) {
                for (let ii=0; ii<bests.length; ii++) {
                    if ((i-1==bests[ii][0]) && (j-1==bests[ii][1])) {
                        cell.style.backgroundColor = "#AC5A67";
                        cell.style.color = "#EEE";
                    }
                }

                directions = dir[i-1][j-1];
                if (directions != null) {
                    for (let ii=0; ii<directions.length; ii++) {
                        switch (directions[ii]) {
                            case "diagonal":
                                direction = document.createElement("div");
                                direction.innerHTML = "&#8598;";
                                direction.classList.add("dia-dir");
                                break;
                            case "left":
                                direction = document.createElement("div");
                                direction.innerHTML = "&#8592;";
                                direction.classList.add("left-dir");
                                break;
                            case "up":
                                direction = document.createElement("div");
                                direction.innerHTML = "&#8593;";
                                direction.classList.add("up-dir");
                                break;
                        }
                        cell.appendChild(direction);
                    }
                }
            }
            document.getElementById("matrix-body").appendChild(cell);
        }
    }
}

function SW() {
    console.log("Not implemented");
}

