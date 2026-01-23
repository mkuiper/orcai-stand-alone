# GROMACS Notes

Use these when the user asks for a GROMACS workflow.

## Required inputs
- Topology: `.top` and `.itp`
- Coordinates: `.gro` or `.pdb`
- MD parameters: `.mdp`

## Minimal flow
1. `gmx grompp` to build `tpr`
2. `gmx mdrun` to run
3. `gmx trjconv` and `gmx energy` for analysis

## Questions to ask
- Force field and water model?
- Target temperature/pressure?
- Simulation length and timestep?
- GPU/CPU availability?
