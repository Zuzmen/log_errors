import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from "@angular/common";
import { DataService } from "../../services/data.service";
import { MatSliderModule } from "@angular/material/slider";
import { CapitalizePipe } from "../../capitalize.pipe";
import { FormsModule } from "@angular/forms";

/** This code represents an Angular component named TabsComponent,
which is designed to work with JSON data, categorize it, display it under different tabs,
and allow users to mark items as favorites and search.
**/

interface ListItem {
  key: string;
  value: any;
  isFavorite: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [ NgIf, NgFor, MatSliderModule, CapitalizePipe, FormsModule ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent implements OnInit {
  // Component state variables
  public jsonData: any;
  public name: string = '';
  public categorizedData: { [category: string]: any[] } = {}; // Stores data categorized by certain criteria
  public selectedCategory: string | null = null;
  public selectedContent: ListItem[] = []; // Filtered content based on selected category and search query
  public searchQuery: string = '';
  public selectedTabIndex: number = 0;
  public showFavorites: boolean = false;
  public errorMessage: string | null = null;

  private favoriteFields: Set<string> = new Set();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Fetches JSON data on component initialization
    this.dataService.getJsonData().subscribe( {
      next: (data) => {
        // Success callback: Processes the fetched data for display
        this.jsonData = data.Events;
        this.categorizeData(); // Categorize the fetched data for tabbed display
        this.selectTab(0); // Select the first tab by default
      },
      error: () => {
        // Update the UI to reflect that an error occurred
        this.errorMessage = 'Failed to load data.';
      }
    });
  }

  public selectTab(index: number): void {
    // Sets the selected tab index and updates the content based on the new selection
    this.selectedTabIndex = index;
    const categories = Object.keys(this.categorizedData);

    if (categories.length > 0) {
      this.selectedCategory = categories[0];
      this.selectedContent = [];
      this.filterItems(); // Updates the displayed items based on the new category
    }
  }

  public toggleCategory(category: string): void {
    // Toggles the selected category, showing or hiding its content
    this.showFavorites = false; // Resets the favorites toggle when changing categories
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.selectedContent = this.selectedCategory ? this.getContent(this.selectedCategory) : [];
  }

  public toggleFavorite(item: ListItem): void {
    // Toggles the favorite status of an item
    if (!item.isFavorite) {
      this.favoriteFields.delete(item.key);
    } else {
      this.favoriteFields.add(item.key);
    }
    item.isFavorite = !item.isFavorite;
  }

  public toggleShowFavorites(event: any): void {
    // Toggles the display to show either all items or only favorites
    this.showFavorites = !this.showFavorites;
    this.filterItems(event.target.checked); // Re-filters items based on the new favorites toggle state
  }

  public calculateWidth(): string {
    // Calculate tab width depending on events length
    const itemWidth = 100;
    const totalItems = this.jsonData?.length;
    const containerWidth = totalItems * itemWidth;

    return containerWidth + 'px';
  }

  public parseTimeStamp(timestampString: any) {
    // Format date and time
    const timestamp = new Date(timestampString);
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  public onInputChange(event: any): void {
    this.searchQuery = event.target.value;
    this.filterItems();
  }

  private categorizeData(): void {
    // Iterates over each item in the JSON data
    this.jsonData.forEach((item: any) => {
      // Iterates over each key in the item's "_rawDataFields" object
      Object.keys(item._rawDataFields).forEach(key => {
        // Matches keys that start with "event_" followed by a category name
        const match = key.match(/^event_([^_]+)_/);
        // If a match is found and a category is extracted
        if (match && match[1]) {
          const category = match[1]; // Extract the category name
          if (!this.categorizedData[category]) {
            this.categorizedData[category] = [];
          }
          // Push the key-value pair into the corresponding category array
          this.categorizedData[category].push({ [key]: item._rawDataFields[key] });
        }
      });
    });
  }

  private filterItems(toggleFavorites?: boolean): void {
    // Reset the selected content array
    this.selectedContent = [];

    if (!this.selectedCategory) return;
    // Create a regular expression based on the search query, case-insensitive
    const regex = new RegExp(this.searchQuery, 'i');
    // Initialize a set to store unique item strings
    const uniqueItems = new Set<string>();
    // Get the data for the selected category
    const categoryData = this.getContent(this.selectedCategory)
    // Iterate over each item in the category data
    Object.entries(categoryData).forEach(([key, value]) => {
      // Format the key for display
      const formattedKey = this.formatKey(value.key);
      // Check if the formatted key or value matches the search query
      if (regex.test(formattedKey) || regex.test(value.value)) {
        const itemString = `${formattedKey}:${value.value}`;
        // Check if the item should be included based on favorites toggle
        if (toggleFavorites) {
          if (!uniqueItems.has(itemString) && value.isFavorite) {
            uniqueItems.add(itemString);
            this.selectedContent.push({ key: value.key, value: value.value, isFavorite: value.isFavorite });
          }
        } else {
          if (!uniqueItems.has(itemString)) {
            uniqueItems.add(itemString);
            this.selectedContent.push({ key: value.key, value: value.value, isFavorite: value.isFavorite });
          }
        }
      }
    });
    // If no items were added, push a placeholder item to display "no data!"
    if (!this.selectedContent.length) {
      this.selectedContent.push({ key: 'no data!', value: '', isFavorite: false});
    }
  }

  private getContent(category: string): { key: string, value: any, isFavorite: boolean }[] {
    // Initialize a set to track seen keys to ensure uniqueness
    const seenKeys = new Set<string>();
    // Reduce the items in the specified category array
    return this.categorizedData[category].reduce((result, item) => {
      const key = Object.keys(item)[0]; // Extract the key of the item
      // If the key hasn't been seen before, add it to the result array
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        result.push({ key, value: item[key], isFavorite: this.favoriteFields.has(key) });
      }

      return result;
    }, []);
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  getItemKey(item: any): string | number {
    if (!item) return 1;

    const key = item.key;
    let formattedKey = key ? key.replace(/^event_[^_]+_/, '').replace(/([A-Z])/g, ' $1') : '';

    formattedKey = formattedKey.length > 60 ? formattedKey.slice(0, 60) + '...' : formattedKey;

    return formattedKey ? formattedKey.replace(/_/g, ' ') : 1;
  }

  getItemValue(item: any): any {
    if (!item) return '';

    let formattedValue: string = item.value.length > 70 ? item.value.slice(0, 70) + '...' : item.value;

    return formattedValue || '';
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substr(0, maxLength) + '...';
    } else {
      return text;
    }
  }
}
