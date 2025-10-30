"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ManifestData } from "@/lib/data-processor"
import { ArrowUpDown } from "lucide-react"

export function ManifestTable({ data }: { data: ManifestData[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold">
                <Button variant="ghost" size="sm" className="gap-2 -ml-4">
                  Manifest ID <ArrowUpDown className="w-4 h-4" />
                </Button>
              </th>
              <th className="text-left p-4 font-semibold">Origin</th>
              <th className="text-left p-4 font-semibold">Destination</th>
              <th className="text-left p-4 font-semibold">HS Code</th>
              <th className="text-left p-4 font-semibold">Value</th>
              <th className="text-left p-4 font-semibold">Tariff Rate</th>
              <th className="text-left p-4 font-semibold">Est. Duty</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <td className="p-4">
                  <span className="font-mono text-sm">{item.id}</span>
                </td>
                <td className="p-4 text-sm">{item.origin}</td>
                <td className="p-4 text-sm">{item.destination}</td>
                <td className="p-4">
                  <Badge variant="outline" className="font-mono text-xs">
                    {item.hsCode}
                  </Badge>
                </td>
                <td className="p-4 text-sm font-medium">${item.value.toLocaleString()}</td>
                <td className="p-4">
                  <Badge variant={item.tariffRate > 15 ? "destructive" : "secondary"}>{item.tariffRate}%</Badge>
                </td>
                <td className="p-4 text-sm font-medium">${item.estimatedDuty.toLocaleString()}</td>
                <td className="p-4">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
