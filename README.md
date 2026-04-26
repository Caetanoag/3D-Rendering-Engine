# 3D Rendering Engine

A lightweight 3D wireframe rendering engine built from scratch using vanilla JavaScript and the Canvas 2D API — no external libraries or frameworks.

All mathematics (matrix operations, perspective projection, 3D rotation) are implemented from first principles, including a custom linear algebra library (`Matrix` and `MatrixMath` classes).

## Demo

| Shape | Controls |
|---|---|
| [Cube](3DRendering/cube.html) | WASD + Arrow Keys + Q/E |
| [Pyramid](3DRendering/pyramid.html) | WASD + Arrow Keys + Q/E + F/R |

## Features

- Perspective projection (field of view simulation via `fov / (fov + z)`)
- 3D rotation on X and Y axes via rotation matrices
- Translation in all three axes
- Uniform scaling around the geometric centroid
- Automatic centroid calculation for any mesh
- Debug overlay with vertex labels, coordinates, and projected position
- Responsive canvas (adapts to window resize)
- Generic `Mesh` class — works with any polyhedron defined by vertices and edges

## Architecture

```
3DRendering/
├── Mesh.js          # Core engine: Matrix, MatrixMath, Mesh classes
├──── examples/
├───────cube.html        # Cube scene
└───────pyramid.html     # Pyramid scene
```

### `Matrix`
Encapsulates a 2D numeric matrix with a private internal array. Supports creation from arrays (`fromArray`), element access (`getAt`, `setAt`), and export back to arrays (`toArray`).

### `MatrixMath`
Static class with matrix operations:
- `add`, `subtract` — element-wise
- `multiplyMatrices` — standard matrix multiplication
- `hadamarProduct` — element-wise multiplication
- `scalarMultiplication` — multiply all elements by a scalar
- `transposition` — transpose a matrix

### `Mesh`
The main rendering class. Receives vertices, edges, FOV, initial angle, canvas and context. Per frame:

1. **Scale** — vertices are scaled around the centroid by `scaleValue`
2. **Rotate** — applies rotation matrix Y then X via matrix multiplication
3. **Project** — perspective projection maps 3D to 2D canvas coordinates
4. **Draw** — renders edges via Canvas 2D API

## Controls

### Cube & Pyramid
| Key | Action |
|---|---|
| `W` / `S` | Rotate on X axis |
| `A` / `D` | Rotate on Y axis |
| `↑` / `↓` | Move up / down |
| `←` / `→` | Move left / right |
| `Q` / `E` | Move closer / further (Z axis) |

### Pyramid only
| Key | Action |
|---|---|
| `F` | Scale up |
| `R` | Scale down |

## Math

Rotation is applied by multiplying the vertex matrix against the rotation matrices for Y and X axes:

```
Ry = [  cos θ,  0,  sin θ ]
     [  0,      1,  0     ]
     [ -sin θ,  0,  cos θ ]

Rx = [ 1,  0,      0     ]
     [ 0,  cos θ, -sin θ ]
     [ 0,  sin θ,  cos θ ]
```

Perspective projection maps a 3D point to a 2D canvas coordinate:

```
scale = fov / (fov + z)
x_screen = (x - centroid.x) * scale + canvas.width / 2
y_screen = (y - centroid.y) * scale + canvas.height / 2
```

Scaling preserves shape by expanding each vertex relative to the centroid:

```
v' = centroid + (v - centroid) * scaleValue
```

## Roadmap

- [ ] Face definition and z-sorting (painter's algorithm)
- [ ] Face fill with color
- [ ] Back-face culling (cross product + dot product)
- [ ] Directional lighting (dot product between face normal and light vector)
- [ ] Delta time for frame-rate independent movement
- [ ] Multiple meshes in the same scene
- [ ] Convex hull generation from arbitrary point sets