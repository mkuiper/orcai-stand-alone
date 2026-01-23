# OpenMM

## Purpose
- Run short MD simulations with explicit solvent using OpenMM.

## Install
```
pip install openmm
python -c "import openmm; print(openmm.__version__)"
```

## Configuration
- Input PDB file required.
- Force field XMLs (e.g., CHARMM36m + TIP3P).

## Common commands
- Run template script:
```
python .opencode/skill/md-openmm/scripts/openmm_run.py
```

## Known issues
- CUDA platform requires compatible drivers; use CPU if CUDA is unavailable.

## References
- https://openmm.org/
