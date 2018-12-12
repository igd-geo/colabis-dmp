import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import {
  IActionMapping, TreeComponent, TreeNode,
  KEYS, TREE_ACTIONS
} from 'angular2-tree-component';

import { Resource, SetSelected, ChangeFolder } from 'app/resources';
import { StateStore } from 'app/state';
import { BrowserService } from 'app/browser';
import { ResourceService } from '../../resources/resource.service';

@Component({
  selector: 'folder-tree',
  styleUrls: [ './tree.style.css' ],
  templateUrl: './tree.component.html'
})
export class ResourceTreeComponent implements OnInit, OnDestroy {
  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  private nodes: any[] = [{
    id: 'root',
    name: '/',
    hasChildren: true
  }];

  private actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node, event) => {
        node.expand();
        this._browser.changeFolder(node.id);
      }
    },
    keys: {
      [KEYS.SPACE]: TREE_ACTIONS.TOGGLE_EXPANDED,
      [KEYS.ENTER]: (tree, node, event) => {
        node.expand();
        this._browser.changeFolder(node.id);
      }
    }
  };

  private options = {
    getChildren: this.getChildren.bind(this),
    actionMapping: this.actionMapping
  };

  private _path: string[] = [];
  private _subscription: Subscription;

  constructor(
    private _browser: BrowserService
  ) { }

  ngOnInit() {
    let path = this._browser.parents
      .zip(this._browser.folder, (p, f) => p.concat(f))
      .map(p => p.map(r => r.id))
      .do(p => this._path = p);

    let children = this._browser.children
        .map(c => c.filter(r => r.is_folder));

    this._subscription = children
        .flatMap(c =>
          path.first().map(p => Object.assign({children: c, path: p}))
        )
        .subscribe(o => {
          let node = this.tree.treeModel.getNodeByPath(o.path.slice());

          if (node && node.children) {
            // only update tree if children were changed
            if (o.children.length !== node.children.length ||
                o.children.some(r => node.children.every(c => r.id !== c.id)) ||
                node !== node.originalNode ) {
              this._collapseAll(node);
              node.children = undefined;
            }
          }
          this._expand();
    });
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  onSelect(id: string) {
    this._browser.selectResource(id);
  }

  openFolder(id: string) {
    this._browser.changeFolder(id);
  }

  getChildren(node: any) {
    return new Promise((resolve, reject) =>
      this._browser.getChildren(node.id)
        .subscribe(children => {
          let nodes = children
            .filter(c => c.is_folder)
            .map(c =>
              Object.assign({}, c, {
                isExpanded: this._path.indexOf(c.id) > -1,
                hasChildren: c.is_folder
              }));
          resolve(nodes);
        })
    );
  }

  private _collapseAll(node: TreeNode) {
    if (node.hasChildren && node.children) {
      node.children.forEach(c => this._collapseAll(c));
    }
    node.collapse();
  }

  private _expand() {
    let last = this._path.reduce((prev, id) => {
      let node = this.tree.treeModel.getNodeById(id);
      if (node) {
        node.expand();
      }
      return node;
    }, null);

    if (last) {
      last.setActiveAndVisible();
    }
  }
}
