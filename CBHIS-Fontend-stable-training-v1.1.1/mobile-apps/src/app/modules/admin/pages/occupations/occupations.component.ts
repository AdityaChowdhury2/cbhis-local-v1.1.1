import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-occupations',
  templateUrl: './occupations.component.html',
  styleUrls: ['./occupations.component.scss'],
})
export class OccupationsComponent implements OnInit {
  array: any[] = [
    {
      name: 1,
    },
    {
      name: 2,
    },
    {
      name: 3,
    },
    {
      name: 4,
    },
    {
      name: 5,
    },
    {
      name: 6,
    },
    {
      name: 7,
    },
    {
      name: 8,
    },
    {
      name: 9,
    },
  ];

  constructor() {}

  ngOnInit() {}
}
