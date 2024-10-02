'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

type PatientData = {
  id?: string
  mrn: string
  referredTo: string
  seenBy: string
  diagnosis: string
  disposition: string
  date: string
}

export default function PatientDataForm() {
  const [patientData, setPatientData] = useState<PatientData[]>([])
  const [formData, setFormData] = useState<PatientData>({
    mrn: '',
    referredTo: '',
    seenBy: '',
    diagnosis: '',
    disposition: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchPatientData = async () => {
      const patientCollection = collection(db, 'patients')
      const patientSnapshot = await getDocs(query(patientCollection, orderBy('date', 'desc')))
      const patientList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PatientData))
      setPatientData(patientList)
    }

    fetchPatientData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, disposition: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const docRef = await addDoc(collection(db, 'patients'), formData)
      setPatientData([{ id: docRef.id, ...formData }, ...patientData])
      setFormData({
        mrn: '',
        referredTo: '',
        seenBy: '',
        diagnosis: '',
        disposition: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error("Error adding document: ", error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Patient Admission & Discharge Data</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            name="mrn"
            placeholder="MRN"
            value={formData.mrn}
            onChange={handleInputChange}
            required
          />
          <Input
            name="referredTo"
            placeholder="Referred To"
            value={formData.referredTo}
            onChange={handleInputChange}
            required
          />
          <Input
            name="seenBy"
            placeholder="Seen By"
            value={formData.seenBy}
            onChange={handleInputChange}
            required
          />
          <Input
            name="diagnosis"
            placeholder="Diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            required
          />
          <Select onValueChange={handleSelectChange} value={formData.disposition}>
            <SelectTrigger>
              <SelectValue placeholder="Disposition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Discharged">Discharged</SelectItem>
              <SelectItem value="Admitted">Admitted</SelectItem>
              <SelectItem value="Transferred">Transferred</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit" className="w-full">Add Patient Data</Button>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MRN</TableHead>
              <TableHead>Referred To</TableHead>
              <TableHead>Seen By</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Disposition</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patientData.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.mrn}</TableCell>
                <TableCell>{data.referredTo}</TableCell>
                <TableCell>{data.seenBy}</TableCell>
                <TableCell>{data.diagnosis}</TableCell>
                <TableCell>{data.disposition}</TableCell>
                <TableCell>{data.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}