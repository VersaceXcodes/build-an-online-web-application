import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductModifierGroup, ProductModifierOption } from '../../types/database';
import './ProductCustomizationEditor.css';

interface ModifierGroupWithOptions extends ProductModifierGroup {
  options: ProductModifierOption[];
}

interface Props {
  productId: string;
}

export const ProductCustomizationEditor: React.FC<Props> = ({ productId }) => {
  const [groups, setGroups] = useState<ModifierGroupWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadModifierGroups();
  }, [productId]);

  const loadModifierGroups = async () => {
    try {
      setLoading(true);
      
      // Load modifier groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('product_modifier_groups')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (groupsError) throw groupsError;

      // Load options for each group
      const groupsWithOptions = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { data: optionsData, error: optionsError } = await supabase
            .from('product_modifier_options')
            .select('*')
            .eq('modifier_group_id', group.id)
            .order('display_order');

          if (optionsError) throw optionsError;

          return {
            ...group,
            options: optionsData || []
          };
        })
      );

      setGroups(groupsWithOptions);
    } catch (error) {
      console.error('Error loading modifier groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const addModifierGroup = () => {
    const newGroup: ModifierGroupWithOptions = {
      id: `temp-${Date.now()}`,
      product_id: productId,
      name: '',
      selection_type: 'single',
      min_selections: 0,
      max_selections: null,
      display_order: groups.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: []
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (groupId: string, updates: Partial<ProductModifierGroup>) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const addOption = (groupId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const newOption: ProductModifierOption = {
          id: `temp-${Date.now()}`,
          modifier_group_id: groupId,
          name: '',
          price_adjustment: 0,
          display_order: g.options.length,
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { ...g, options: [...g.options, newOption] };
      }
      return g;
    }));
  };

  const updateOption = (groupId: string, optionId: string, updates: Partial<ProductModifierOption>) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          options: g.options.map(o => 
            o.id === optionId ? { ...o, ...updates } : o
          )
        };
      }
      return g;
    }));
  };

  const deleteOption = (groupId: string, optionId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          options: g.options.filter(o => o.id !== optionId)
        };
      }
      return g;
    }));
  };

  const saveChanges = async () => {
    try {
      setSaving(true);

      // Delete existing groups and options (they will cascade)
      const existingGroups = groups.filter(g => !g.id.startsWith('temp-'));
      if (existingGroups.length > 0) {
        await supabase
          .from('product_modifier_groups')
          .delete()
          .eq('product_id', productId);
      }

      // Insert new groups and options
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        
        const { data: newGroup, error: groupError } = await supabase
          .from('product_modifier_groups')
          .insert({
            product_id: productId,
            name: group.name,
            selection_type: group.selection_type,
            min_selections: group.min_selections,
            max_selections: group.max_selections,
            display_order: i
          })
          .select()
          .single();

        if (groupError) throw groupError;

        // Insert options for this group
        if (group.options.length > 0) {
          const optionsToInsert = group.options.map((option, j) => ({
            modifier_group_id: newGroup.id,
            name: option.name,
            price_adjustment: option.price_adjustment,
            display_order: j,
            available: option.available
          }));

          const { error: optionsError } = await supabase
            .from('product_modifier_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }

      await loadModifierGroups();
      alert('Customizations saved successfully!');
    } catch (error) {
      console.error('Error saving customizations:', error);
      alert('Error saving customizations. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="customization-editor-loading">Loading customizations...</div>;
  }

  return (
    <div className="customization-editor">
      <div className="customization-editor-header">
        <h3>Customizations</h3>
        <button 
          className="btn-primary"
          onClick={addModifierGroup}
          disabled={saving}
        >
          <Plus size={20} />
          Create Modifier Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="customization-empty">
          <p>No customization groups yet. Click "Create Modifier Group" to add toppings, sauces, or other options.</p>
        </div>
      ) : (
        <div className="modifier-groups">
          {groups.map((group, groupIndex) => (
            <div key={group.id} className="modifier-group-card">
              <div className="modifier-group-header">
                <div className="drag-handle">
                  <GripVertical size={20} />
                </div>
                <div className="modifier-group-title">
                  <span className="group-number">Group {groupIndex + 1}</span>
                  <button
                    className="btn-delete"
                    onClick={() => deleteGroup(group.id)}
                    disabled={saving}
                    aria-label="Delete group"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="modifier-group-form">
                <div className="form-row">
                  <label>
                    Group Name
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                      placeholder="e.g., Choose Your Sauce"
                      disabled={saving}
                    />
                  </label>
                </div>

                <div className="form-row form-row-split">
                  <label>
                    Selection Type
                    <select
                      value={group.selection_type}
                      onChange={(e) => updateGroup(group.id, { selection_type: e.target.value as 'single' | 'multi' })}
                      disabled={saving}
                    >
                      <option value="single">Single Select (Radio)</option>
                      <option value="multi">Multi Select (Checkboxes)</option>
                    </select>
                  </label>

                  {group.selection_type === 'multi' && (
                    <label>
                      Max Selections
                      <input
                        type="number"
                        value={group.max_selections || ''}
                        onChange={(e) => updateGroup(group.id, { 
                          max_selections: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        placeholder="Unlimited"
                        min="1"
                        disabled={saving}
                      />
                    </label>
                  )}
                </div>

                <div className="modifier-options-section">
                  <div className="options-header">
                    <h4>Options</h4>
                    <button
                      className="btn-add-option"
                      onClick={() => addOption(group.id)}
                      disabled={saving}
                    >
                      <Plus size={16} />
                      Add Option
                    </button>
                  </div>

                  {group.options.length === 0 ? (
                    <p className="options-empty">No options yet. Click "Add Option" to create one.</p>
                  ) : (
                    <div className="modifier-options">
                      {group.options.map((option) => (
                        <div key={option.id} className="modifier-option">
                          <div className="option-fields">
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) => updateOption(group.id, option.id, { name: e.target.value })}
                              placeholder="Option name (e.g., Nutella)"
                              disabled={saving}
                              className="option-name"
                            />
                            <input
                              type="number"
                              value={option.price_adjustment}
                              onChange={(e) => updateOption(group.id, option.id, { 
                                price_adjustment: parseFloat(e.target.value) || 0 
                              })}
                              placeholder="0.00"
                              step="0.01"
                              disabled={saving}
                              className="option-price"
                            />
                            <button
                              className="btn-delete-option"
                              onClick={() => deleteOption(group.id, option.id)}
                              disabled={saving}
                              aria-label="Delete option"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="customization-editor-footer">
          <button
            className="btn-primary btn-save"
            onClick={saveChanges}
            disabled={saving}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
};
