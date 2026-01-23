# GROMACS

## Purpose
- Run MD simulations using GROMACS workflows.

## Install
```
# Example (Ubuntu)
sudo apt install gromacs
gmx --version
```

## Configuration
- Required: `.top` topology, `.gro` coordinates, `.mdp` parameters.

## Common commands
- Build TPR:
```
gmx grompp -f md.mdp -c input.gro -p topol.top -o run.tpr
```
- Run:
```
gmx mdrun -deffnm run
```

## Known issues
- GROMACS versions can affect defaults; note exact version in results.

## References
- https://www.gromacs.org/
