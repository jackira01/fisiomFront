"use client";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { filtersAtom } from "../store/servicios";
import { AiFillHome } from "react-icons/ai";
import { FaBriefcaseMedical } from "react-icons/fa6";
import { getSpecialties } from "@/services/types";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

export default function SearchSpecialty() {
  const [filters, setFilters] = useAtom(filtersAtom);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchSpecialties = async () => {
      try {
        const data = await getSpecialties();
        setSpecialties(data.types || []);
      } catch (error) {
        if (error.name === "CanceledError") return;
        console.error('Error fetching specialties:', error);
      }
    };
    
    fetchSpecialties();
    return () => abortController.abort();
  }, []);

  const onSelectionChange = (value) => {
    setFilters((filters) => ({ ...filters, specialtyId: value, page: 1 }));
  };

  return (
    <Autocomplete
      startsWidth={<AiFillHome />}
      label="Seleccione:"
      placeholder="Especialidad"
      className="w-full sm:max-w-sm"
      defaultItems={specialties}
      listboxProps={{
        color: "primary",
      }}
      allowsCustomValue={true}
      selectedKey={filters.specialtyId}
      onSelectionChange={onSelectionChange}
    >
      {(item) => (
        <AutocompleteItem key={item._id} textValue={item.name}>
          <div className="flex items-center gap-2">
            <FaBriefcaseMedical alt={item.name} className="text-primary-300" />
            <span>{item.name}</span>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
