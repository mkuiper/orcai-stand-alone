---
name: md-openmm
description: Run molecular dynamics simulations (OpenMM default) or guide MD workflows. Use when asked to run a molecular dynamics simulation, perform molecular dynamics, or do a molecular simulation.
---

# MD Simulation (OpenMM-first)

Use this skill to run short, reproducible MD simulations with realistic aqueous conditions.

## Defaults (OpenMM)
- Force field: CHARMM36m + TIP3P water
- Padding: 0.8–1.0 nm
- Ionic strength: 0.15 M; neutralize
- Temperature: 310 K (physio) or 300 K (baseline)
- Pressure: 1 atm (MonteCarloBarostat)
- Constraints: HBonds; rigid water on
- HMR: hydrogenMass=4 amu
- Timestep: 4 fs
- Trajectory: every 25,000 steps

## Workflow
1. Prepare structure: remove heterogens, add missing atoms/hydrogens.
2. Center complex before solvation.
3. Solvate with minimal padding; record box size.
4. Minimize and equilibrate (0.1–0.5 ns).
5. Run production in segments with checkpoints.
6. Write DCD and PSF for VMD compatibility.

## OpenMM script
Use `scripts/openmm_run.py` as the starting template.

## Other engines
If the user requests GROMACS/AMBER/CHARMM, provide a high-level plan and ask for engine-specific inputs (topology, force field, solvent model, run length).
