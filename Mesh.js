export class Matrix {
    #array;
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.#array = Array.from({ length: rows }, () => new Array(columns).fill(0));
    }
    static fromArray(data) {
        const rows = data.length;
        const cols = data[0].length;
        const matrix = new Matrix(rows, cols);
        matrix.fillMatrix(data);
        return matrix;
    }
    fillMatrix(array_matrix) {
        if(array_matrix.length !== this.rows || array_matrix[0].length !== this.columns){
            throw new Error("A matriz de preenchimento deve corresponder ao tamanho da matriz objeto");
        }
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                if(!isFinite(array_matrix[r][c])){
                    throw new Error("O tipo dos elementos do array devem ser numéricos");
                    
                }
                this.#array[r][c] = array_matrix[r][c];
            }
        }
        return this;
    }
    getAt(row, col) {
        return this.#array[row][col];
    }

    setAt(row, col, value) {
        this.#array[row][col] = value;
    }
    toArray() {
        return Array.from({ length: this.rows }, (_, r) =>
            Array.from({ length: this.columns }, (_, c) => this.#array[r][c])
        );
    }
}
export class MatrixMath {
    static #operate(matrixA, matrixB, operationFn) {
        if (!(matrixA instanceof Matrix) || !(matrixB instanceof Matrix)) {
            throw new Error("Ambos os parâmetros devem ser instâncias de Matrix.");
        }
        if (matrixA.rows !== matrixB.rows || matrixA.columns !== matrixB.columns) {
            throw new Error("As matrizes devem ter a mesma ordem para soma.");
        }
        const result = new Matrix(matrixA.rows, matrixA.columns);
        for (let r = 0; r < matrixA.rows; r++) {
            for (let c = 0; c < matrixA.columns; c++) {
                const val = operationFn(matrixA.getAt(r,c), matrixB.getAt(r,c));
                result.setAt(r, c, val);
            }
        }
        return result;
    }
    static add(matrixA, matrixB){
        return this.#operate(matrixA, matrixB, (a,b) => a+b);
    }
    static subtract(matrixA, matrixB){
        return this.#operate(matrixA, matrixB, (a,b) => a-b)
    }
    static multiplyMatrices(matrixA, matrixB){
        if(!(matrixA instanceof Matrix) || !(matrixB instanceof Matrix)){
            throw new Error("Ambos os parâmetros devem ser instâncias de Matrix.");
        }
        if(matrixA.columns != matrixB.rows){
            throw new Error("A quantidade de linhas da matriz A precisa ser igual a quantidade de colunas de B")
        }
        const result = new Matrix(matrixA.rows, matrixB.columns);
        for (let r = 0; r < matrixA.rows; r++) {
            for (let c = 0; c < matrixB.columns; c++) {
                let sum = 0;
                for(let k = 0; k < matrixA.columns; k++){
                    sum += matrixA.getAt(r,k)*matrixB.getAt(k,c);
                }
                result.setAt(r,c,sum)
            }
            
        }
        return result;
    }
    static hadamarProduct(matrixA, matrixB){
        return this.#operate(matrixA, matrixB, (a,b) => a*b);
    }
    static scalarMultiplication(matrix, scalar){
        if (!(matrix instanceof Matrix)) {
            throw new Error("Matrix deve ser uma instância da classe Matrix");
        }
        if (typeof scalar !== 'number' || !Number.isFinite(scalar)){
            throw new Error("Scalar deve ser uma instância da classe Number");
        }
        const result = new Matrix(matrix.rows, matrix.columns);
        for(let r = 0; r < result.rows; r++){
            for(let c = 0; c < result.columns; c++){
                result.setAt(r, c, matrix.getAt(r, c) * scalar);
            }
        }
        return result;
    }
    static transposition(matrix){
        if (!(matrix instanceof Matrix)) {
            throw new Error("Matrix deve ser uma instância da classe Matrix");
        }
        const result = new Matrix(matrix.columns, matrix.rows);
        for(let r = 0; r < matrix.rows; r++){
            for(let c = 0; c < matrix.columns; c++){
                result.setAt(c,r, matrix.getAt(r,c));
            }
        }
        return result;
    }
}

export class Mesh {
    constructor(vertices, conectores, fov, angle, canvas, ctx){
        this.vertices = vertices;
        this.conectores = conectores;
        this.fov = fov;
        this.angle = {
            x: angle.x,
            y: angle.y
        }
        this.position = {
            x: 0,
            y: 0,
            z: 0
        }
        this.canvas = canvas;
        this.ctx = ctx;
        this.scaleValue = 1;
        this.centroid = this.#getCentroid();
    }
    draw() {
        
        const rotatedVertices = this.rotate()
        const normalizedVertices = this.#normalizeToFov(rotatedVertices);
        this.drawInformation(normalizedVertices);
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.conectores.length; i++) {
            const p1 = normalizedVertices[this.conectores[i][0]];
            const p2 = normalizedVertices[this.conectores[i][1]]; 
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke(); 
            
        }
    }
    rotate(){
        const rotationYMatrix = [
            [ Math.cos(this.angle.y), 0, Math.sin(this.angle.y)],
            [           0,            1,         0             ],
            [-Math.sin(this.angle.y), 0, Math.cos(this.angle.y)]
        ]
        const rotationXMatrix = [
            [1, 0,                      0                   ],
            [0, Math.cos(this.angle.x), -Math.sin(this.angle.x)],
            [0, Math.sin(this.angle.x),  Math.cos(this.angle.x)]
        ];
        const toMatrix = this.vertices.map(({x,y,z}) => 
            [
                (x - this.centroid.x) * this.scaleValue,
                (y - this.centroid.y) * this.scaleValue,
                (z - this.centroid.z) * this.scaleValue
            ])

        const rotatedYMatrix = MatrixMath.multiplyMatrices(Matrix.fromArray(toMatrix), Matrix.fromArray(rotationYMatrix));
        const rotatedXMatrix = MatrixMath.multiplyMatrices(rotatedYMatrix, Matrix.fromArray(rotationXMatrix))
        return rotatedXMatrix.toArray().map(([x, y, z]) => ({ x: x + this.centroid.x, y: y + this.centroid.y, z: z + this.centroid.z }));
    }
    #normalizeToFov(rotatedVertex){
        const normalized = [];
        for (let i = 0; i < rotatedVertex.length; i++) {
            let p = rotatedVertex[i];
            let scale = this.fov / (this.fov + p.z + this.position.z);

            normalized.push(
                {
                    x: (p.x + this.position.x - this.centroid.x) * scale + this.canvas.width/2,
                    y: (p.y + this.position.y - this.centroid.y) * scale + this.canvas.height/2
                }
            )
        }
        return normalized;
    }
    #getCentroid() {
        const n = this.vertices.length;
        return {
            x: this.vertices.reduce((s, v) => s + v.x, 0) / n,
            y: this.vertices.reduce((s, v) => s + v.y, 0) / n,
            z: this.vertices.reduce((s, v) => s + v.z, 0) / n,
        };
    }
    move(x, y, z){
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
    }
    drawInformation(normalizedVertices){
        const projectedCentroid = {
            x: normalizedVertices.reduce((s, v) => s + v.x, 0) / normalizedVertices.length,
            y: normalizedVertices.reduce((s, v) => s + v.y, 0) / normalizedVertices.length
        };
        this.ctx.font = "30px serif"
        this.ctx.fillStyle = "rgba(0,0,0,0.7)";
        this.ctx.fillRect(0, this.canvas.height - 50 * (normalizedVertices.length), 250, 50*(normalizedVertices.length));

        normalizedVertices.forEach((p, i) => {
            const offsetX = p.x < projectedCentroid.x ? -10 : 10;
            const offsetY = p.y < projectedCentroid.y ? -10 : 10;
            
            this.ctx.textAlign = offsetX < 0 ? "right" : "left";
            this.ctx.textBaseline = offsetY < 0 ? "bottom" : "top";
            
            this.ctx.fillStyle = "red";
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 10, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.fillStyle = "black";
            this.ctx.fillText(`${i}`, p.x + offsetX, p.y + offsetY);
            

            this.ctx.fillStyle = "white"
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "alphabetic";
            this.ctx.fillText(`${i}: (${Math.ceil(p.x)}, ${Math.ceil(p.y)})`, 50, this.canvas.height - 50 * i);
        });
    }
}