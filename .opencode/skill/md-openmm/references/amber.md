# AMBER Notes

Use these when the user asks for an AMBER workflow.

## Required inputs
- Topology: `.prmtop`
- Coordinates: `.inpcrd`
- MD parameters: input control file (`.in`)

## Minimal flow
1. `tleap` to build topology/coordinates
2. `pmemd` or `sander` to run
3. `cpptraj` for analysis

## Questions to ask
- Force field and water model?
- Target temperature/pressure?
- Simulation length and timestep?
- GPU/CPU availability?
