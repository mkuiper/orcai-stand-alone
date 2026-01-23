#!/usr/bin/env python3
"""
OpenMM MD template (short aqueous run).
Fill in the TODOs and adjust paths to your system.
"""
from pathlib import Path

from openmm.app import (
    PDBFile,
    Modeller,
    ForceField,
    Simulation,
    DCDReporter,
    StateDataReporter,
    PDBReporter,
)
from openmm import (
    MonteCarloBarostat,
    LangevinMiddleIntegrator,
    Platform,
)
from openmm.unit import (
    nanometer,
    kelvin,
    picosecond,
    bar,
    amu,
    picoseconds,
)


def main():
    # TODO: set input PDB and output directory
    pdb_path = Path("input.pdb")
    out_dir = Path("md_out")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Load structure
    pdb = PDBFile(str(pdb_path))

    # Force field
    ff = ForceField("charmm36.xml", "charmm36/water.xml")

    # Center + solvate
    modeller = Modeller(pdb.topology, pdb.positions)
    modeller.addSolvent(
        ff,
        model="tip3p",
        padding=0.9 * nanometer,
        ionicStrength=0.15,
        neutralize=True,
    )

    # System
    system = ff.createSystem(
        modeller.topology,
        nonbondedMethod=None,  # TODO: set PME if desired
        constraints="HBonds",
        rigidWater=True,
        hydrogenMass=4 * amu,
    )
    system.addForce(MonteCarloBarostat(1 * bar, 310 * kelvin))

    # Integrator
    integrator = LangevinMiddleIntegrator(
        310 * kelvin,
        1 / picosecond,
        0.004 * picoseconds,
    )

    # Platform (optional)
    platform = Platform.getPlatformByName("CUDA") if Platform.getNumPlatforms() > 1 else None

    # Simulation
    simulation = Simulation(modeller.topology, system, integrator, platform) if platform else Simulation(
        modeller.topology, system, integrator
    )
    simulation.context.setPositions(modeller.positions)

    # Minimize
    simulation.minimizeEnergy()

    # Equilibrate
    simulation.context.setVelocitiesToTemperature(310 * kelvin)
    simulation.step(25000)  # 100 ps at 4 fs

    # Reporters
    simulation.reporters.append(DCDReporter(str(out_dir / "traj.dcd"), 25000))
    simulation.reporters.append(StateDataReporter(str(out_dir / "state.log"), 25000, step=True, time=True, temperature=True, potentialEnergy=True, density=True))
    simulation.reporters.append(PDBReporter(str(out_dir / "final.pdb"), 250000))

    # Production
    simulation.step(250000)  # 1 ns at 4 fs


if __name__ == "__main__":
    main()
