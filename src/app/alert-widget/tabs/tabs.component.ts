import {Component, OnInit} from '@angular/core';
import {NgIf, NgFor} from "@angular/common";
import {DataService} from "../../services/data.service";
import {MatSliderModule} from "@angular/material/slider";
import {CapitalizePipe} from "../../capitalize.pipe";
import {FormsModule} from "@angular/forms";

interface ListItem {
  key: string;
  value: any;
  isFavorite: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    NgIf, NgFor, MatSliderModule, CapitalizePipe, FormsModule
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent implements OnInit {
  public jsonData: any;
  public name: string = '';
  public categorizedData: { [category: string]: any[] } = {};
  public selectedCategory: string | null = null;
  public selectedContent: { key: string, value: any, isFavorite: boolean }[] = [];
  public searchQuery: string = '';
  public selectedTabIndex = 0;
  public showFavorites: boolean = false;

  private favoriteFields: Set<string> = new Set();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getJsonData().subscribe(data => {
      this.jsonData = data.Events;
      this.categorizeData();
      this.selectTab(0);
    });
  }

  public selectTab(index: number): void {
    this.selectedTabIndex = index;
    const categories = Object.keys(this.categorizedData);

    if (categories.length > 0) {
      this.selectedCategory = categories[0];
      this.selectedContent = [];
      this.filterItems();
    }
  }

  public calculateWidth(): string {
    const itemWidth = 100;
    const totalItems = this.jsonData?.length;
    const containerWidth = totalItems * itemWidth;

    return containerWidth + 'px';
  }

  public parseTimeStamp(timestampString: any) {
    const timestamp = new Date(timestampString);
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  public toggleCategory(category: string): void {
    this.showFavorites = false;
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.selectedContent = this.selectedCategory ? this.getContent(this.selectedCategory) : [];
  }

  public onInputChange(event: any): void {
    this.searchQuery = event.target.value;
    this.filterItems();
  }

  public toggleFavorite(item: ListItem): void {
    if (!item.isFavorite) {
      this.favoriteFields.delete(item.key);
    } else {
      this.favoriteFields.add(item.key);
    }
    item.isFavorite = !item.isFavorite;
  }

  public toggleShowFavorites(event: any): void {
    this.showFavorites = !this.showFavorites;
    this.filterItems(event.target.checked);
  }

  private categorizeData(): void {
    this.jsonData.forEach((item: any) => {
      Object.keys(item._rawDataFields).forEach(key => {
        const match = key.match(/^event_([^_]+)_/);
        if (match && match[1]) {
          const category = match[1];
          if (!this.categorizedData[category]) {
            this.categorizedData[category] = [];
          }
          this.categorizedData[category].push({ [key]: item._rawDataFields[key] });
        }
      });
    });
  }

  private filterItems(toggleFavorites?: boolean): void {
    this.selectedContent = [];

    if (!this.selectedCategory) return;

    const regex = new RegExp(this.searchQuery, 'i');
    const uniqueItems = new Set<string>();
    const categoryData = this.getContent(this.selectedCategory)

    Object.entries(categoryData).forEach(([key, value]) => {
      const formattedKey = this.formatKey(value.key);

      if (regex.test(formattedKey) || regex.test(value.value)) {
        const itemString = `${formattedKey}:${value.value}`;

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

    if (!this.selectedContent.length) {
      this.selectedContent.push({ key: 'no data!', value: '', isFavorite: false});
    }
  }

  private getContent(category: string): { key: string, value: any, isFavorite: boolean }[] {
    const seenKeys = new Set<string>();

    return this.categorizedData[category].reduce((result, item) => {
      const key = Object.keys(item)[0];

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
